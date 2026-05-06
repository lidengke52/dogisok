import { Metadata } from "next"
import { Mail, MessageSquare, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us - Dog is OK",
  description: "Get in touch with Dog is OK. We're here to help with any questions or feedback.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">联系我们</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            有任何问题或建议？我们很乐意听取您的意见。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {/* Email Contact */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">电子邮件</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              发送邮件至我们的支持团队
            </p>
            <a
              href="mailto:dog@coleaze.com"
              className="text-primary hover:underline font-medium"
            >
              dog@coleaze.com
            </a>
          </div>

          {/* Quick Response */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">快速回复</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              我们通常在24小时内回复
            </p>
            <p className="text-primary font-medium">
              平均响应时间：2小时
            </p>
          </div>

          {/* Support Hours */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">支持时间</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              全周客户支持
            </p>
            <p className="text-primary font-medium">
              周一至周日 24/7
            </p>
          </div>
        </div>

        {/* Main Contact Form Section */}
        <div className="rounded-lg border border-border bg-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">发送消息</h2>
          <p className="text-muted-foreground mb-6">
            请填写下方表格，我们会尽快回复您。
          </p>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                您的名字
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="请输入您的名字"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                电子邮件地址
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                主题
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择一个主题</option>
                <option value="feedback">功能反馈</option>
                <option value="bug">报告问题</option>
                <option value="account">账户问题</option>
                <option value="general">一般咨询</option>
                <option value="partnership">合作机会</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                您的消息
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="请详细描述您的问题或建议..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              发送消息
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="rounded-lg border border-border bg-secondary/20 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">常见问题</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">我的账户安全吗？</h3>
              <p className="text-muted-foreground">
                是的。我们使用行业标准的加密和安全措施来保护您的个人信息。请参阅我们的隐私政策了解更多详情。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI 咨询的结果准确吗？</h3>
              <p className="text-muted-foreground">
                Dr. Max AI 咨询提供参考信息，但不能替代专业兽医诊断。如果您的宠物有严重症状，请立即联系兽医。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">如何重置我的密码？</h3>
              <p className="text-muted-foreground">
                在登录页面点击"忘记密码"，按照说明重置您的密码。如需帮助，请与我们联系。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">推荐计划如何运作？</h3>
              <p className="text-muted-foreground">
                您可以邀请朋友注册 Dog is OK，当他们成功注册并使用功能后，您就可以获得奖励。请查看推荐计划了解详情。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
