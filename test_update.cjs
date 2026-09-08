const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages', 'dashboard');
const excludeFiles = ['PigmyCustomers.jsx', 'Leads.jsx', 'Merchants.jsx'];
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.jsx') && !excludeFiles.includes(f));

for (const file of files) {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Update <table ... className="...">
  content = content.replace(/<table([^>]*)className=["']([^"']*)["']([^>]*)>/g, (match, before, classNames, after) => {
    let classes = classNames.split(' ').map(c => c.trim()).filter(Boolean);
    classes = classes.filter(c => c !== 'text-left');
    if (!classes.includes('w-full')) classes.push('w-full');
    if (!classes.includes('text-center')) classes.push('text-center');
    if (!classes.includes('text-sm')) classes.push('text-sm');
    if (!classes.includes('whitespace-nowrap')) classes.push('whitespace-nowrap');
    return `<table${before}className="${classes.join(' ')}"${after}>`;
  });

  // 2. Update <thead ...>
  content = content.replace(/<thead([^>]*)className=["'][^"']*["']([^>]*)>/g, (match, before, after) => {
    return `<thead${before}className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]"${after}>`;
  });
  content = content.replace(/<thead(?![^>]*className=)([^>]*)>/g, (match, attrs) => {
    return `<thead${attrs} className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">`;
  });

  // 3. Update <tr> inside <thead>
  content = content.replace(/(<thead[^>]*>[\s\S]*?)<\/thead>/g, (theadBlock) => {
    return theadBlock.replace(/<tr([^>]*)className=["'][^"']*["']/g, '<tr$1');
  });

  // 4. Update <th>
  content = content.replace(/<th\b([^>]*)className=["']([^"']*)["']([^>]*)>/g, (match, before, classNames, after) => {
    let classes = classNames.split(' ').map(c => c.trim()).filter(Boolean);
    let customClasses = classes.filter(c => 
      c.startsWith('w-') || 
      c.startsWith('min-w-') || 
      c.startsWith('max-w-') ||
      c.startsWith('text-') && (c === 'text-right' || c === 'text-left')
    );
    let newClasses = ['py-3.5', 'px-3', 'text-xs', 'font-semibold', 'text-white', 'uppercase', 'tracking-wider', 'border-r', 'border-white/20', 'text-center', ...customClasses];
    return `<th${before}className="${newClasses.join(' ')}"${after}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Test Done');
