const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/supabase-js/2.39.3/supabase.js'
];

const outputPath = path.join(__dirname, 'js', 'supabase.js');

function download(url, callback) {
    console.log('尝试下载:', url);
    const file = fs.createWriteStream(outputPath);
    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            console.log('状态码:', res.statusCode, '尝试下一个镜像...');
            file.close();
            fs.unlinkSync(outputPath);
            callback(false);
            return;
        }
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            const size = fs.statSync(outputPath).size;
            console.log('下载成功！文件大小:', (size / 1024).toFixed(1), 'KB');
            callback(true);
        });
    }).on('error', (err) => {
        console.log('下载错误:', err.message);
        file.close();
        fs.unlinkSync(outputPath);
        callback(false);
    });
}

let tried = 0;
(function tryNext() {
    if (tried >= urls.length) {
        console.log('所有镜像都失败了，请手动下载');
        process.exit(1);
        return;
    }
    download(urls[tried], (success) => {
        if (success) process.exit(0);
        else { tried++; tryNext(); }
    });
})();
