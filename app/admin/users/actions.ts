"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import type { User } from "@supabase/supabase-js"

export async function toggleUserAdmin(targetEmail: string, makeAdmin: boolean) {
  const supabase = await createClient()

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return { error: "未登录" }
  }

  // 检查当前用户是否是超级管理员
  if (user.email !== "admin@dogisok.net") {
    // 检查是否有管理员权限
    const hasAdmin = await isAdmin(user.id)
    if (!hasAdmin) {
      return { error: "权限不足：只有超级管理员可以设置其他管理员" }
    }
  }

  // 不能修改自己的权限
  if (user.email === targetEmail) {
    return { error: "不能修改自己的权限" }
  }

  // 更新 profiles 表中的 is_admin 字段
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: makeAdmin })
    .eq("email", targetEmail)

  if (error) {
    return { error: `更新失败: ${error.message}` }
  }

  return { success: true }
}
