document.addEventListener('DOMContentLoaded', function() {
    // 获取保存的语言设置并立即应用
    const savedLang = localStorage.getItem('preferred-language') || 'zh-CN';
    setLanguage(savedLang);

    // 语言切换按钮事件
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
            localStorage.setItem('preferred-language', lang);
            
            // 移除所有按钮的active类
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.remove('active');
            });
            // 为当前选中的按钮添加active类
            btn.classList.add('active');
        });
    });

    function setLanguage(lang) {
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // 显示对应语言的文本
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const isEnglish = lang === 'en';
            if (el.dataset.i18n.endsWith('-en')) {
                el.style.display = isEnglish ? 'inline-block' : 'none';
            } else {
                el.style.display = isEnglish ? 'none' : 'inline-block';
            }
        });

        // 更新页面语言标记
        document.documentElement.lang = lang;
    }

    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewArea = document.getElementById('previewArea');
    const downloadBtn = document.getElementById('downloadAll');
    const resetBtn = document.getElementById('resetBtn');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // 处理点击上传
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 处理拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#34a853';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#4285f4';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#4285f4';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImage(files[0]);
        }
    });

    // 处理文件选择
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImage(e.target.files[0]);
        }
    });

    // 添加文件验证函数
    function validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
        
        if (!allowedTypes.includes(file.type)) {
            alert('只支持 JPG、PNG 和 SVG 格式的图片！');
            return false;
        }
        
        if (file.size > maxSize) {
            alert('图片大小不能超过5MB！');
            return false;
        }
        
        return true;
    }

    // 修改handleImage函数
    function handleImage(file) {
        if (!validateFile(file)) {
            return;
        }

        // 添加loading状态
        uploadArea.innerHTML = '<div class="loading">处理中...</div>';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    generateIcons(img);
                    uploadArea.style.display = 'none';
                    previewArea.style.display = 'block';
                } catch (error) {
                    alert('生成图标时出错: ' + error.message);
                    resetUploadArea();
                }
            };
            img.onerror = () => {
                alert('图片加载失败！');
                resetUploadArea();
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert('读取文件失败！');
            resetUploadArea();
        };
        reader.readAsDataURL(file);
    }

    // 生成不同尺寸的图标
    function generateIcons(sourceImg) {
        const sizes = [16, 32, 48, 128];
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // 使用双线性插值算法
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 绘制图片
            ctx.drawImage(sourceImg, 0, 0, size, size);
            
            // 显示预览
            const preview = document.getElementById(`preview${size}`);
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            preview.appendChild(img);
        });
    }

    // 修改下载按钮的事件处理
    document.addEventListener('click', (e) => {
        if (e.target.closest('.download-single-btn')) {
            const btn = e.target.closest('.download-single-btn');
            const size = btn.dataset.size;
            const preview = document.getElementById(`preview${size}`);
            const img = preview.querySelector('img');
            if (img) {
                const link = document.createElement('a');
                link.download = `icon${size}.png`;
                link.href = img.src;
                link.click();
            }
        }
    });

    // 修改全选功能
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.icon-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    // 单个复选框变化时更新全选状态
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('icon-checkbox')) {
            updateSelectAllState();
        }
    });

    // 更新全选状态的函数
    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.icon-checkbox');
        const checkedBoxes = document.querySelectorAll('.icon-checkbox:checked');
        selectAllCheckbox.checked = checkboxes.length === checkedBoxes.length;
    }

    // 修改重置功能
    resetBtn.addEventListener('click', () => {
        // 重置文件输入
        imageInput.value = '';
        
        // 重置预览区域
        const previewBoxes = document.querySelectorAll('.preview-box');
        previewBoxes.forEach(box => {
            box.innerHTML = '';
        });
        
        // 重置复选框
        const checkboxes = document.querySelectorAll('.icon-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectAllCheckbox.checked = false;
        
        // 切换显示状态
        previewArea.style.display = 'none';
        uploadArea.style.display = 'block';
        
        // 重置上传区域内容
        uploadArea.innerHTML = `
            <input type="file" id="imageInput" accept="image/*" hidden>
            <div class="upload-box">
                <img src="upload-icon.svg" alt="上传图标" class="upload-icon">
                <p>点击或拖拽图片到这里</p>
                <p class="upload-tip">支持PNG、JPG、SVG格式</p>
            </div>
        `;
        
        // 重新绑定文件输入事件
        const newImageInput = document.getElementById('imageInput');
        newImageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImage(e.target.files[0]);
            }
        });
    });

    // 修改下载选中图标的功能
    const downloadSelectedBtn = document.getElementById('downloadSelected');
    downloadSelectedBtn.addEventListener('click', () => {
        const selectedSizes = Array.from(document.querySelectorAll('.icon-checkbox:checked'))
            .map(checkbox => checkbox.dataset.size);
        
        if (selectedSizes.length === 0) {
            alert('请至少选择一个图标尺寸！');
            return;
        }

        selectedSizes.forEach((size, index) => {
            setTimeout(() => {
                const preview = document.getElementById(`preview${size}`);
                const img = preview.querySelector('img');
                if (img) {
                    const link = document.createElement('a');
                    link.download = `icon${size}.png`;
                    link.href = img.src;
                    link.click();
                }
            }, index * 500);
        });
    });

    // 添加单个下载按钮的事件处理
    document.querySelectorAll('.download-single-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            const preview = document.getElementById(`preview${size}`);
            const img = preview.querySelector('img');
            
            if (img) {
                const link = document.createElement('a');
                link.download = `icon${size}.png`;
                link.href = img.src;
                link.click();
            } else {
                alert('未找到图标，请先上传图片！');
            }
        });
    });

    // 添加绑定下载事件的函数
    function bindDownloadEvents() {
        document.querySelectorAll('.download-single-btn').forEach(btn => {
            const size = btn.dataset.size;
            const preview = document.getElementById(`preview${size}`);
            const img = preview.querySelector('img');
            
            btn.onclick = () => {
                if (img) {
                    const link = document.createElement('a');
                    link.download = `icon${size}.png`;
                    link.href = img.src;
                    link.click();
                }
            };
        });
    }
}); 