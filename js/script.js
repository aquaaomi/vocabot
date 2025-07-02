document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // ここをあなたのCloudflare WorkerのURLに置き換えてください
    const workerUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/'; 

    try {
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password }),
        });

        if (response.ok) {
            // 認証成功
            window.location.href = './protected/'; // 保護されたページへリダイレクト
        } else {
            // 認証失敗
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'ログインに失敗しました。';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'ネットワークエラーが発生しました。';
    }
});