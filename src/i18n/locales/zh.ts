/**
 * Chinese translations (简体中文)
 */

import type { Translations } from '../types.js';

const translations: Translations = {
  pillars: {
    docs: '文档',
    style: '代码风格与校验',
    build: '构建系统',
    test: '测试',
    security: '安全',
    observability: '调试与可观测性',
    env: '开发环境',
    task_discovery: '任务发现',
    product: '产品与实验',
    agent_config: 'AI 代理配置',
    code_quality: '代码质量',
  },

  levels: {
    L1: '可运行',
    L2: '有文档',
    L3: '标准化',
    L4: '已优化',
    L5: '自治',
    none: '未达成',
  },

  priorities: {
    critical: '紧急',
    high: '高',
    medium: '中',
    low: '低',
  },

  cli: {
    scanning: '正在扫描: {path}',
    profile: '配置文件: {profile}',
    error: '错误: {message}',
    pathNotFound: '路径不存在: {path}',
    invalidLevel: '无效的级别: {level}',
    validLevels: '有效级别: L1, L2, L3, L4, L5',
    invalidOutput: '无效的输出格式: {format}',
    validOutputs: '有效格式: json, markdown, both',
    scanFailed: '扫描失败:',
    jsonOutput: 'JSON 输出: {path}',
  },

  output: {
    title: 'AI Agent 就绪度报告',
    repository: '仓库:',
    commit: '提交:',
    profileLabel: '配置:',
    time: '时间:',
    level: '级别: {level}',
    score: '分数: {score}%',
    notAchieved: '未达成',
    progressTo: '距离 {level} 进度:',
    pillarSummary: '支柱摘要',
    levelBreakdown: '级别分解',
    actionItems: '行动项',
    monorepoApps: 'Monorepo 应用',
    andMore: '... 还有 {count} 项 (使用 --verbose 查看全部)',
    checks: '{passed}/{total} 项检查',
    required: '{passed}/{total} 项必需',
    errorLabel: '错误',
  },

  checks: {
    fileNotFound: '文件未找到: {path}',
    fileExists: '文件存在: {path}',
    patternMatched: '匹配 {count} 个文件',
    noMatches: '没有文件匹配模式: {pattern}',
    workflowEventFound: '找到工作流事件 "{event}"',
    workflowEventNotFound: '未找到事件 "{event}" 的工作流',
    actionFound: '找到 GitHub Action "{action}"',
    actionNotFound: '未找到 GitHub Action "{action}"',
    buildCommandFound: '找到构建命令 "{command}"',
    noBuildCommand: '未检测到构建命令',
    logFrameworkFound: '找到日志框架 "{framework}"',
    noLogFramework: '未检测到日志框架',
    dependencyFound: '找到依赖 "{package}"',
    noDependency: '未找到所需依赖',
    anyOfPassed: '{count}/{total} 项子检查通过',
    anyOfFailed: '所有子检查均未通过',
  },

  init: {
    dryRunHeader: '模拟运行 - 将创建的文件:',
    wouldCreate: '将创建: {path}',
    creatingFile: '正在创建: {path}',
    fileCreated: '已创建: {path}',
    fileSkipped: '已跳过 (已存在): {path}',
    fileOverwritten: '已覆盖: {path}',
    noTemplates: '未找到符合条件的模板',
    initComplete: '初始化完成',
    filesCreated: '{count} 个文件已创建',
    filesSkipped: '{count} 个文件已跳过',
  },
};

export default translations;
