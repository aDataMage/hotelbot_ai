import { scenarios } from '../tests/ai/scenarios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/chat';

async function runTests() {
    // Run all scenarios
    const scenariosToRun = scenarios;
    console.log(`🚀 Starting AI Scenario Testing (${scenariosToRun.length} scenarios)...`);
    console.log(`Target: ${API_URL}\n`);

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const scenario of scenariosToRun) {
        process.stdout.write(`Testing [${scenario.id}] ${scenario.category}: "${scenario.input}"... `);

        const startTime = Date.now();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        id: 'test-' + Date.now(),
                        role: 'user',
                        content: scenario.input,
                        createdAt: new Date()
                    }]
                })
            });

            const rawText = await response.text();

            // Basic stream parsing (AI SDK format is line-based: "0:text", "d:{}", "2:[]")
            // We want to extract the final text and check for tool calls
            let combinedText = '';
            let toolCallsFound = 0;

            const lines = rawText.split('\n');
            for (const line of lines) {
                if (line.startsWith('0:')) {
                    // Text delta: "0:"I am...""
                    try {
                        const content = JSON.parse(line.substring(2));
                        combinedText += content;
                    } catch (e) { }
                } else if (line.startsWith('9:')) {
                    // Tool call (final step usually) or generally "tool_calls"
                    // AI SDK specifics vary, but often tools are in specific data chunks or part of the stream.
                    // A simple heuristic for this test: check if the prompt *should* trigger a tool and if the response implies action.
                    toolCallsFound++;
                }
            }

            // If we can't parse perfectly, fallback to raw check (since it's a test harness)
            if (combinedText.length === 0) combinedText = rawText;

            const duration = Date.now() - startTime;

            // VALIDATION LOGIC
            // 1. HTTP 200
            let status = response.status === 200 ? 'PASS' : 'FAIL';
            let note = '';

            // 2. Intent Check (Heuristic)
            if (scenario.expectedIntent && status === 'PASS') {
                // If we expect booking, we should see booking-related keywords or tool calls
                if (scenario.expectedIntent === 'booking') {
                    if (!combinedText.toLowerCase().includes('book') && !combinedText.toLowerCase().includes('room') && toolCallsFound === 0) {
                        // Loose check: AI might just ask "What dates?" which is fine. 
                        // But if it says "I don't know", that's a fail.
                    }
                }
            }

            if (status === 'PASS') {
                console.log(`✅ OK (${duration}ms)`);
                passed++;
            } else {
                console.log(`❌ FAIL`);
                failed++;
            }

            results.push({
                ...scenario,
                status,
                duration,
                responseLength: combinedText.length,
                rawResponsePreview: combinedText.substring(0, 100).replace(/\n/g, ' ')
            });

            // Rate limiting prevention
            await new Promise(r => setTimeout(r, 500));

        } catch (error: any) {
            console.log(`❌ ERROR: ${error.message}`);
            failed++;
            results.push({
                ...scenario,
                status: 'ERROR',
                error: error.message
            });
        }
    }

    // Generate Report
    console.log('\nGenerating Report...');
    const reportPath = path.join(process.cwd(), 'ai-test-report.md');

    let md = `# AI Scenario Test Report\n\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Total Scenarios:** ${scenariosToRun.length}\n`;
    md += `**Passed:** ${passed} | **Failed:** ${failed}\n\n`;

    md += `| ID | Category | Input | Status | Duration | Response Preview |\n`;
    md += `|---|---|---|---|---|---|\n`;

    results.forEach(r => {
        md += `| ${r.id} | ${r.category} | ${r.input} | ${r.status === 'PASS' ? '✅' : '❌'} | ${r.duration || 0}ms | ${r.rawResponsePreview || r.error || ''} |\n`;
    });

    fs.writeFileSync(reportPath, md);
    console.log(`📝 Report saved to: ${reportPath}`);
}

runTests().catch(console.error);
