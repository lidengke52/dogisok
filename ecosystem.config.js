module.exports = {
  apps: [
    {
      name: 'dog-is-ok',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 'max', // 使用最大 CPU 核数
      exec_mode: 'cluster', // 集群模式提高并发
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      
      // 自动重启配置
      max_memory_restart: '1G', // 内存超过 1GB 自动重启
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // 优雅关闭
      kill_timeout: 30000,
      listen_timeout: 10000,
      
      // 监控文件变化（仅开发环境）
      watch: false,
      
      // 日志格式
      merge_logs: false,
      
      // 环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],

  // 全局设置
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log',
  combine_logs: true,
  autorestart: true,
  max_memory_restart: '500M',
};
