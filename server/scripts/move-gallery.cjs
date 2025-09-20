const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.resolve(process.cwd(), 'client/public/images'),
  path.resolve(process.cwd(), 'public/images'), 
  path.resolve(process.cwd(), 'dist/assets')
];
const dest = path.resolve(process.cwd(), 'uploads');

console.log('📁 Migrating gallery images...');
console.log('Target directory:', dest);

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
  console.log('✅ Created uploads directory');
}

for (const d of srcDirs) {
  console.log(`\n🔍 Checking: ${d}`);
  if (!fs.existsSync(d)) {
    console.log('❌ Directory does not exist');
    continue;
  }
  
  const files = fs.readdirSync(d);
  console.log(`📄 Found ${files.length} files`);
  
  for (const f of files) {
    if (!/\.(png|jpe?g|webp|gif)$/i.test(f)) continue;
    
    const s = path.join(d, f);
    const t = path.join(dest, f);
    
    if (!fs.existsSync(t)) {
      fs.copyFileSync(s, t);
      console.log(`✅ Copied: ${f}`);
    } else {
      console.log(`⏭️  Skip: ${f} (exists)`);
    }
  }
}

const finalFiles = fs.readdirSync(dest);
console.log(`\n🎉 Migration complete! Found ${finalFiles.length} files in uploads:`);
finalFiles.forEach(f => console.log(`   - ${f}`));
console.log(`\n📍 Directory: ${dest}`);