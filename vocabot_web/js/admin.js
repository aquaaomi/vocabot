document.addEventListener('DOMContentLoaded', function() {
    const workerBaseUrl = 'https://mute-term-d732.aomiaqua43.workers.dev/api/';

    // フォームの要素を取得
    const announcementForm = document.getElementById('announcementForm');
    const minuteForm = document.getElementById('minuteForm');
    const scheduleForm = document.getElementById('scheduleForm');

    // 議事録フォーム
    minuteForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('minuteTitle').value;
        const content = document.getElementById('minuteContent').value;
        const messageElement = document.getElementById('minuteMessage');
        const kvKey = document.getElementById('minuteKvKey').value;

        if (kvKey) { // 編集モード
            await updateData(workerBaseUrl + 'minutes/update', { key: kvKey, title, content }, messageElement, minuteForm);
        } else { // 新規投稿モード
            await postData(workerBaseUrl + 'minutes/post', { title, content }, messageElement, minuteForm);
        }
    });

    // お知らせフォーム
    announcementForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        const messageElement = document.getElementById('announcementMessage');
        const kvKey = document.getElementById('announcementKvKey').value;

        if (kvKey) { // 編集モード
            await updateData(workerBaseUrl + 'announcements/update', { key: kvKey, title, content }, messageElement, announcementForm);
        } else { // 新規投稿モード
            await postData(workerBaseUrl + 'announcements/post', { title, content }, messageElement, announcementForm);
        }
    });

    // スケジュールフォーム
    scheduleForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('scheduleTitle').value;
        const date = document.getElementById('scheduleDate').value;
        const time = document.getElementById('scheduleTime').value;
        const endDate = document.getElementById('scheduleEndDate').value;
        const endTime = document.getElementById('scheduleEndTime').value;
        const location = document.getElementById('scheduleLocation').value;
        const color = document.getElementById('scheduleColor').value; // 色を取得
        const messageElement = document.getElementById('scheduleMessage');
        const kvKey = document.getElementById('scheduleKvKey').value;

        const scheduleData = { title, date, time, endDate, endTime, location, color }; // 色を追加

        if (kvKey) { // 編集モード
            await updateData(workerBaseUrl + 'schedule/update', { key: kvKey, ...scheduleData }, messageElement, scheduleForm);
        } else { // 新規投稿モード
            await postData(workerBaseUrl + 'schedule/post', scheduleData, messageElement, scheduleForm);
        }
    });

    // 投稿処理 (新規作成)
    async function postData(url, data, messageElement, formElement) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = '投稿が成功しました！';
                messageElement.style.color = 'green';
                formElement.reset(); // フォームをリセット
                // 投稿成功後、投稿一覧を更新
                if (typeof loadPosts === 'function') {
                    loadPosts(); 
                }
            } else {
                messageElement.textContent = `投稿に失敗しました: ${result.message || '不明なエラー'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            messageElement.textContent = 'ネットワークエラーが発生しました。';
            messageElement.style.color = 'red';
        }
    }

    // 更新処理
    async function updateData(url, data, messageElement, formElement) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = '更新が成功しました！';
                messageElement.style.color = 'green';
                formElement.reset(); // フォームをリセット
                // 更新成功後、投稿一覧を更新
                if (typeof loadPosts === 'function') {
                    loadPosts(); 
                }
                // 編集モードを解除
                setFormMode(formElement, 'post');
            } else {
                messageElement.textContent = `更新に失敗しました: ${result.message || '不明なエラー'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            messageElement.textContent = 'ネットワークエラーが発生しました。';
            messageElement.style.color = 'red';
        }
    }

    // フォームのモードを設定 (投稿/更新)
    function setFormMode(formElement, mode, submitButtonText = '投稿') {
        const submitBtn = formElement.querySelector('.submit-btn');
        const kvKeyInput = formElement.querySelector('input[type="hidden"]');

        if (mode === 'post') {
            submitBtn.textContent = submitButtonText;
            kvKeyInput.value = '';
            formElement.reset();
        } else if (mode === 'update') {
            submitBtn.textContent = '更新';
        }
    }

    // クリアボタンのイベントリスナー
    document.querySelectorAll('.clear-btn').forEach(button => {
        button.addEventListener('click', function() {
            const formType = this.dataset.formType;
            let formElement;
            let messageElement;
            if (formType === 'announcement') {
                formElement = announcementForm;
                messageElement = document.getElementById('announcementMessage');
            } else if (formType === 'minute') {
                formElement = minuteForm;
                messageElement = document.getElementById('minuteMessage');
            } else if (formType === 'schedule') {
                formElement = scheduleForm;
                messageElement = document.getElementById('scheduleMessage');
            }
            formElement.reset();
            messageElement.textContent = '';
            setFormMode(formElement, 'post');
        });
    });

    // 編集モードに切り替える関数 (admin_list.jsから呼び出される)
    window.editPost = function(post) {
        let formElement;
        let kvKeyInput;
        let submitBtnText;

        if (post.type === 'announcement') {
            formElement = announcementForm;
            kvKeyInput = document.getElementById('announcementKvKey');
            document.getElementById('announcementTitle').value = post.title;
            document.getElementById('announcementContent').value = post.content;
            submitBtnText = '更新';
        } else if (post.type === 'minute') {
            formElement = minuteForm;
            kvKeyInput = document.getElementById('minuteKvKey');
            document.getElementById('minuteTitle').value = post.title;
            document.getElementById('minuteContent').value = post.content;
            submitBtnText = '更新';
        } else if (post.type === 'schedule') {
            formElement = scheduleForm;
            kvKeyInput = document.getElementById('scheduleKvKey');
            document.getElementById('scheduleTitle').value = post.title;
            document.getElementById('scheduleDate').value = post.date;
            document.getElementById('scheduleTime').value = post.time;
            document.getElementById('scheduleEndDate').value = post.endDate || ''; // 終了日時がなければ空文字列
            document.getElementById('scheduleEndTime').value = post.endTime || ''; // 終了日時がなければ空文字列
            document.getElementById('scheduleLocation').value = post.location || ''; // 場所がなければ空文字列
            document.getElementById('scheduleColor').value = post.color || '#FFFFFF'; // 色がなければデフォルト
            submitBtnText = '更新';
        }

        if (formElement) {
            kvKeyInput.value = post.kvKey;
            setFormMode(formElement, 'update', submitBtnText);
            // 該当フォームまでスクロール
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
});