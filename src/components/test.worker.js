function test() {
    console.log('test');
    return 12;
}

onmessage = (msg) => {
    // console.log('Worker: Message received');
    // const res = test();

    // postMessage(res);
};
