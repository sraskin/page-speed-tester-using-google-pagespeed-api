const request = require('request');
const saveReport = require('../services/saveReport');
require('dotenv').config();
const PAGE_SPEED_API_KEY = process.env.PAGE_SPEED_API_KEY;

exports.test = async (req, res) => {
    res.status(200).json({
        message: 'Server is running!'
    });
};

function getPerformanceScore(strategy, testUrl) {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${testUrl}&key=${PAGE_SPEED_API_KEY}&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&strategy=${strategy}`,
            'headers': {
                'Content-Type': 'application/json',
                'Connection': 'keep-alive'
            }
        };
        request(options, function(error, response) {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(response.body));
        });
    });
}

exports.checkPerformance = async (req, res) => {
    //get data from testUrl param
    const testUrl = req.query.testUrl;
    const results = [];
    if (!testUrl) {
        return res.status(400).json({
            message: 'URL is required in testUrl query parameter. Example: /check-performance?testUrl=example.com'
        });
    }
    if (!testUrl.includes('https://') && !testUrl.includes('http://')) {
        return res.status(400).json({
            message: 'URL should start with https:// or http://'
        });
    }
    await getPerformanceScore('MOBILE', testUrl).then(async (res) => {
        const testDetails = {
            strategy: 'MOBILE',
            url: res.id,
            requestedUrl: res.lighthouseResult.requestedUrl,
            finalUrl: res.lighthouseResult.finalUrl,
            lighthouseVersion: res.lighthouseResult.lighthouseVersion,
            userAgent: res.lighthouseResult.userAgent,
            fetchTime: res.lighthouseResult.fetchTime,
            environment: res.lighthouseResult.environment,
            runWarnings: res.lighthouseResult.runWarnings,
            audits: JSON.stringify(res.lighthouseResult.audits),
            categories: JSON.stringify(res.lighthouseResult.categories),
            categoryGroups: JSON.stringify(res.lighthouseResult.categoryGroups),
            timing: res.lighthouseResult.timing,
            i18n: JSON.stringify(res.lighthouseResult.i18n),
            entities: JSON.stringify(res.lighthouseResult.entities),
            analysisUTCTimestamp: res.analysisUTCTimestamp
        };
        //Diagnose performance issues
        const performanceScore = res.lighthouseResult.categories.performance.score * 100;
        const accessibilityScore = res.lighthouseResult.categories.accessibility.score * 100;
        const bestPracticesScore = res.lighthouseResult.categories['best-practices'].score * 100;
        const seoScore = res.lighthouseResult.categories.seo.score * 100;
        const pwaScore = res.lighthouseResult.categories.pwa.score * 100;
        const entities =  res.lighthouseResult.entities

        //loadingExperience
        const loadingExperience = {
            CUMULATIVE_LAYOUT_SHIFT_SCORE: {
                percentile: res.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 + '%',
                category: res.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category,
                explanation: 'Good (≤ 0.1), Needs Improvement (0.1 - 0.25), Poor (> 0.25)'
            },
            TIME_TO_FIRST_BYTE: {
                percentile: res.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile / 1000 + 's',
                category: res.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.category,
                explanation: 'Good (≤ 0.8 s), Needs Improvement (0.8 - 1.8 s), Poor (> 1.8 s)'
            },
            FIRST_CONTENTFUL_PAINT: {
                percentile: res.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile + 's',
                category: res.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
                explanation: 'Good (≤ 1.8 s), Needs Improvement (1.8 - 3.0 s), Poor (> 3.0 s)'
            },
            FIRST_INPUT_DELAY: {
                percentile: res.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile + 'ms',
                category: res.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category,
                explanation: 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
            },
            INTERACTION_TO_NEXT_PAINT: {
                percentile: res.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile + 'ms',
                category: res.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.category,
                explanation: 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
            },
            LARGEST_CONTENTFUL_PAINT: {
                percentile: res.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000 + 's',
                category: res.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.category,
                explanation: 'Good (≤ 2.5 s), Needs Improvement (2.5 - 4.0 s), Poor (> 4.0 s)'
            }
        };

        //save to mongodb
        await saveReport(
            performanceScore,
            accessibilityScore,
            bestPracticesScore,
            seoScore,
            pwaScore,
            loadingExperience,
            testDetails
        ).then(() => {
            console.log('Score saved');
        }).catch((err) => {
            console.log(err);
        });
        results.push(
            {
                mobile: {
                    performanceScore,
                    accessibilityScore,
                    bestPracticesScore,
                    seoScore,
                    pwaScore,
                    loadingExperience,
                    entities
                }
            }
        );
    });
    await getPerformanceScore('DESKTOP', testUrl).then(async (res) => {
        const testDetails = {
            strategy: 'DESKTOP',
            url: res.id,
            requestedUrl: res.lighthouseResult.requestedUrl,
            finalUrl: res.lighthouseResult.finalUrl,
            lighthouseVersion: res.lighthouseResult.lighthouseVersion,
            userAgent: res.lighthouseResult.userAgent,
            fetchTime: res.lighthouseResult.fetchTime,
            environment: res.lighthouseResult.environment,
            runWarnings: res.lighthouseResult.runWarnings,
            audits: JSON.stringify(res.lighthouseResult.audits),
            categories: JSON.stringify(res.lighthouseResult.categories),
            categoryGroups: JSON.stringify(res.lighthouseResult.categoryGroups),
            timing: res.lighthouseResult.timing,
            i18n: JSON.stringify(res.lighthouseResult.i18n),
            entities: JSON.stringify(res.lighthouseResult.entities),
            analysisUTCTimestamp: res.analysisUTCTimestamp
        };
        const performanceScore = res.lighthouseResult.categories.performance.score * 100;
        const accessibilityScore = res.lighthouseResult.categories.accessibility.score * 100;
        const bestPracticesScore = res.lighthouseResult.categories['best-practices'].score * 100;
        const seoScore = res.lighthouseResult.categories.seo.score * 100;
        const pwaScore = res.lighthouseResult.categories.pwa.score * 100;
        const entities =  res.lighthouseResult.entities

        //loadingExperience
        const loadingExperience = {
            CUMULATIVE_LAYOUT_SHIFT_SCORE: {
                percentile: res.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 + '%',
                category: res.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category,
                explanation: 'Good (≤ 0.1), Needs Improvement (0.1 - 0.25), Poor (> 0.25)'
            },
            TIME_TO_FIRST_BYTE: {
                percentile: res.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile / 1000 + 's',
                category: res.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.category,
                explanation: 'Good (≤ 0.8 s), Needs Improvement (0.8 - 1.8 s), Poor (> 1.8 s)'
            },
            FIRST_CONTENTFUL_PAINT: {
                percentile: res.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile + 's',
                category: res.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
                explanation: 'Good (≤ 1.8 s), Needs Improvement (1.8 - 3.0 s), Poor (> 3.0 s)'
            },
            FIRST_INPUT_DELAY: {
                percentile: res.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile + 'ms',
                category: res.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category,
                explanation: 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
            },
            INTERACTION_TO_NEXT_PAINT: {
                percentile: res.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile + 'ms',
                category: res.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.category,
                explanation: 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
            },
            LARGEST_CONTENTFUL_PAINT: {
                percentile: res.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000 + 's',
                category: res.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.category,
                explanation: 'Good (≤ 2.5 s), Needs Improvement (2.5 - 4.0 s), Poor (> 4.0 s)'
            }
        };

        //save to mongodb
        await saveReport(
            performanceScore,
            accessibilityScore,
            bestPracticesScore,
            seoScore,
            pwaScore,
            loadingExperience,
            testDetails
        ).then(() => {
            console.log('Score saved');
        }).catch((err) => {
            console.log(err);
        });
        results.push(
            {
                desktop: {
                    performanceScore,
                    accessibilityScore,
                    bestPracticesScore,
                    seoScore,
                    pwaScore,
                    loadingExperience,
                    entities
                }
            }
        );
    });
    await res.status(200).json(results);
};