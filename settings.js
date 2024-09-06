document.addEventListener('DOMContentLoaded', () => {
    const timeInputs = document.querySelectorAll('.time-input');

    timeInputs.forEach(input => {
        input.addEventListener('focus', handleTimeFocus);
        input.addEventListener('input', handleTimeInput);
        input.addEventListener('keydown', handleTimeKeydown);
        input.addEventListener('blur', handleTimeBlur);
    });

        // タブ切り替えの機能を追加
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // すべてのタブからactiveクラスを削除
            tabs.forEach(t => t.classList.remove('active'));
            // クリックされたタブにactiveクラスを追加
            tab.classList.add('active');

            // すべてのタブコンテンツを非表示にする
            tabContents.forEach(content => content.classList.remove('active'));
            // クリックされたタブに対応するコンテンツを表示する
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});

function handleTimeFocus(e) {
    this.select();
}

function handleTimeInput(e) {
    this.value = this.value.replace(/\D/g, '');
    
    if (this.value.length > 2) {
        this.value = this.value.slice(0, 2);
    }
    
    let max = this.classList.contains('minutes') ? 99 : 59;
    let value = parseInt(this.value, 10);
    if (value > max) {
        this.value = max.toString().padStart(2, '0');
    }
}

function handleTimeKeydown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        const container = this.closest('.time-input-container');
        const inputs = Array.from(container.querySelectorAll('.time-input'));
        const currentIndex = inputs.indexOf(e.target);
        const nextIndex = (currentIndex + direction + inputs.length) % inputs.length;
        inputs[nextIndex].focus();
    }
}

function handleTimeBlur(e) {
    this.value = this.value.padStart(2, '0');
}