const Report = require('../models/Report');

exports.test = async (req, res) => {
    res.status(200).json({
        message: 'Server is running!'
    });
};

exports.getReport = async (req, res) => {
    const days = req.query.days; // assuming the number of days is passed as a query parameter
    console.log('days:', days);

    const now = new Date();
    const pastDate = new Date(now.setDate(now.getDate() - days));
    const data = await Report.find({ time: { $gte: pastDate } });
    // Group data by URL
    const groupedData = data.reduce((acc, item) => {
        const url = item.testDetails.url;
        if (!acc[url]) {
            acc[url] = [];
        }
        acc[url].push(item);
        return acc;
    }, {});
    // Calculate averages for each URL
    const averages = Object.keys(groupedData).map((url) => {
        const data = groupedData[url];

        const sum = {
            performanceScore: 0,
            accessibilityScore: 0,
            bestPracticesScore: 0,
            seoScore: 0,
            pwaScore: 0,
            loadingExperience: {
                CUMULATIVE_LAYOUT_SHIFT_SCORE: 0,
                TIME_TO_FIRST_BYTE: 0,
                FIRST_CONTENTFUL_PAINT: 0,
                FIRST_INPUT_DELAY: 0,
                INTERACTION_TO_NEXT_PAINT: 0,
                LARGEST_CONTENTFUL_PAINT: 0
            }
        };

        data.forEach((item) => {
            sum.performanceScore += parseFloat(item.performanceScore);
            sum.accessibilityScore += parseFloat(item.accessibilityScore);
            sum.bestPracticesScore += parseFloat(item.bestPracticesScore);
            sum.seoScore += parseFloat(item.seoScore);
            sum.pwaScore += parseFloat(item.pwaScore);
            Object.keys(sum.loadingExperience).forEach((key) => {
                sum.loadingExperience[key] += parseFloat(
                    item.loadingExperience[key].percentile
                );
            });
        });

        const average = {
            url: url,
            performanceScore:
                (sum.performanceScore / data.length).toFixed(2) + '%',
            accessibilityScore:
                (sum.accessibilityScore / data.length).toFixed(2) + '%',
            bestPracticesScore:
                (sum.bestPracticesScore / data.length).toFixed(2) + '%',
            seoScore: (sum.seoScore / data.length).toFixed(2) + '%',
            pwaScore: (sum.pwaScore / data.length).toFixed(2) + '%',
            loadingExperience: {}
        };
        //     if (key === 'CUMULATIVE_LAYOUT_SHIFT_SCORE') {
        //         let percentile = sum.loadingExperience[key] / data.length;
        //         let category = '';
        //         if (percentile <= 0.1) {
        //             category = 'Good';
        //         } else if (percentile > 0.1 && percentile <= 0.25) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + '%',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 0.1), Needs Improvement (0.1 - 0.25), Poor (> 0.25)'
        //         };
        //     } else if (key === 'TIME_TO_FIRST_BYTE') {
        //         let percentile = sum.loadingExperience[key] / data.length;
        //         let category = '';
        //         if (percentile <= 0.8) {
        //             category = 'Good';
        //         } else if (percentile > 0.8 && percentile <= 1.8) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + 's',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 0.8 s), Needs Improvement (0.8 - 1.8 s), Poor (> 1.8 s)'
        //         };
        //     } else if (key === 'FIRST_CONTENTFUL_PAINT') {
        //         let percentile =
        //             sum.loadingExperience[key] / data.length / 1000;
        //         let category = '';
        //         if (percentile <= 0.8) {
        //             category = 'Good';
        //         } else if (percentile > 0.8 && percentile <= 1.8) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + 's',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 1.8 s), Needs Improvement (1.8 - 3.0 s), Poor (> 3.0 s)'
        //         };
        //     } else if (key === 'FIRST_INPUT_DELAY') {
        //         let percentile = sum.loadingExperience[key] / data.length;
        //         let category = '';
        //         if (percentile <= 100) {
        //             category = 'Good';
        //         } else if (percentile > 100 && percentile <= 300) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + 'ms',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
        //         };
        //     } else if (key === 'INTERACTION_TO_NEXT_PAINT') {
        //         let percentile = sum.loadingExperience[key] / data.length;
        //         let category = '';
        //         if (percentile <= 100) {
        //             category = 'Good';
        //         } else if (percentile > 100 && percentile <= 300) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + 'ms',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 100 ms), Needs Improvement (100 - 300 ms), Poor (> 300 ms)'
        //         };
        //     } else if (key === 'LARGEST_CONTENTFUL_PAINT') {
        //         let percentile = sum.loadingExperience[key] / data.length;
        //         let category = '';
        //         if (percentile <= 2.5) {
        //             category = 'Good';
        //         } else if (percentile > 2.5 && percentile <= 4.0) {
        //             category = 'Needs Improvement';
        //         } else {
        //             category = 'Poor';
        //         }
        //         average.loadingExperience[key] = {
        //             percentile: percentile.toFixed(2) + 's',
        //             category: category,
        //             explanation:
        //                 'Good (≤ 2.5 s), Needs Improvement (2.5 - 4.0 s), Poor (> 4.0 s)'
        //         };
        //     }
        // });

        const metrics = {
            CUMULATIVE_LAYOUT_SHIFT_SCORE: {
                good: 0.1,
                needsImprovement: 0.25,
                unit: '%'
            },
            TIME_TO_FIRST_BYTE: { good: 0.8, needsImprovement: 1.8, unit: 's' },
            FIRST_CONTENTFUL_PAINT: {
                good: 0.8,
                needsImprovement: 1.8,
                unit: 's',
                scale: 1000
            },
            FIRST_INPUT_DELAY: { good: 100, needsImprovement: 300, unit: 'ms' },
            INTERACTION_TO_NEXT_PAINT: {
                good: 100,
                needsImprovement: 300,
                unit: 'ms'
            },
            LARGEST_CONTENTFUL_PAINT: {
                good: 2.5,
                needsImprovement: 4.0,
                unit: 's'
            }
        };

        const getCategory = (percentile, { good, needsImprovement }) => {
            if (percentile <= good) {
                return 'Good';
            } else if (percentile > good && percentile <= needsImprovement) {
                return 'Needs Improvement';
            } else {
                return 'Poor';
            }
        };

        Object.keys(sum.loadingExperience).forEach((key) => {
            const metric = metrics[key];
            if (metric) {
                let percentile = sum.loadingExperience[key] / data.length;
                if (metric.scale) {
                    percentile /= metric.scale;
                }
                const category = getCategory(percentile, metric);
                average.loadingExperience[key] = {
                    percentile: percentile.toFixed(2) + metric.unit,
                    category: category,
                    explanation: `Good (≤ ${metric.good}${metric.unit}), Needs Improvement (${metric.good}${metric.unit} - ${metric.needsImprovement}${metric.unit}), Poor (> ${metric.needsImprovement}${metric.unit})`
                };
            }
        });
        return average;
    });
    res.status(200).json({
        message: 'Success',
        help: 'Add query param for the report. ?days=1 means last 1 day, ?days=7 means last 7 days, etc.',
        data: averages
    });
};
