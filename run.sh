#! /bin/sh

# https://stackoverflow.com/questions/3572030/bash-script-absolute-path-with-os-x
function realpath () {
  [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

# https://code-maven.com/bash-absolute-path
function current_dir () {
  full_path=$(realpath $0)
  dir_path=$(dirname $full_path)
  echo $dir_path
}

dir=$(current_dir $0)

# search & kill pid: https://www.cnblogs.com/lovychen/p/6211209.html

$dir/bin/music-taste-recommend.out &
node $dir/client/music-taste-recommend.js &
sleep 10 && kill $(pgrep 'music-taste-recommend')

# can't use wait then kill, it will wait all process to be finished

db=$dir/db
f=`ls -t $db | head -n 1`

node -p "
const concatMap = (f, s = ', ') => xs => xs.map(f).join(s);
const r = require('$db/$f');
concatMap((x, i) => String(i + 1).padStart(2, ' ') + '. ' + x.name + ' - ' + concatMap(x => x.name, ' & ')(x.artists), '\n')(r)"

npx prettier $db/$f --write

cd $dir

git add ./db
git commit -m "new file: db/$f"
git push

