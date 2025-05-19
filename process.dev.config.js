module.exports = {
  apps: [
    {
      name: 'dev-api.minds-navi.com',
      script: 'node ./dist/main.js',
      watch: false,
      ignore_watch: ['node_modules', '.git', 'test', 'prisma', 'dist'],
      watch_options: {
        followSymlinks: false,
      },
      instances: 1,
      //   exec_mode: "cluster",
      merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
      autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
      max_memory_restart: '1024M', // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
      env: {
        NODE_ENV: 'dev',
      },
    },
  ],
};
