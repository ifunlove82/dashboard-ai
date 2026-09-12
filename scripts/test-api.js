async function runTest() {
    try {
        const res = await fetch('http://localhost:3050/api/stats?branch=HQHN&timeframe=Tháng&loaiXNK=ALL');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        if (!data.metrics) throw new Error('Missing metrics object');
        if (data.metrics.revenue.target === undefined) throw new Error('Missing target in response');
        if (data.metrics.revenue.actual === undefined) throw new Error('Missing actual in response');
        
        console.log('PASS: Analytics Engine API works');
    } catch (err) {
        console.error('FAIL:', err.message);
        process.exit(1);
    }
}
runTest();
