document.addEventListener('DOMContentLoaded', async function() {
    const latestMinutesDiv = document.getElementById('latest-minutes');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/minutes/latest'; 

    try {
        const response = await fetch(workerUrl);
        const minutes = await response.json();

        if (response.ok && minutes.length > 0) {
            latestMinutesDiv.innerHTML = ''; // 読み込み中メッセージをクリア
            const ul = document.createElement('ul');
            minutes.forEach(minute => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="./minutes_list.html#${minute.timestamp}">${minute.date} ${minute.title}</a>`;
                ul.appendChild(li);
            });
            latestMinutesDiv.appendChild(ul);
        } else if (response.ok && minutes.length === 0) {
            latestMinutesDiv.innerHTML = '<p>まだ議事録がありません。</p>';
        } else {
            latestMinutesDiv.innerHTML = `<p>議事録の読み込みに失敗しました: ${minutes.message || '不明なエラー'}</p>`;
            console.error('Failed to load minutes:', minutes);
        }
    } catch (error) {
        console.error('Error fetching latest minutes:', error);
        latestMinutesDiv.innerHTML = '<p>ネットワークエラーにより議事録を読み込めませんでした。</p>';
    }
});