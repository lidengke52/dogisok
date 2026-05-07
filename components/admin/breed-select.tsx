'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type BreedOption = {
  slug: string
  name: string
  cnName?: string
}

interface BreedSelectProps {
  breeds: BreedOption[]
  defaultValue?: string | null
  name: string
  placeholder?: string
  disabled?: boolean
}

export function BreedSelect({
  breeds,
  defaultValue = 'none',
  name,
  placeholder = '搜索并选择犬种...',
  disabled = false,
}: BreedSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedValue, setSelectedValue] = useState(defaultValue || 'none')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 过滤品种列表
  const filteredBreeds = breeds.filter((breed) => {
    const searchLower = search.toLowerCase()
    return (
      breed.name.toLowerCase().includes(searchLower) ||
      breed.cnName?.toLowerCase().includes(searchLower)
    )
  })

  // 获取当前选中的品种显示文本
  const selectedBreed =
    selectedValue && selectedValue !== 'none'
      ? breeds.find((b) => b.slug === selectedValue)
      : null

  const displayText = selectedBreed
    ? `${selectedBreed.name}${selectedBreed.cnName ? ` · ${selectedBreed.cnName}` : ''}`
    : '不关联'

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      // 打开时聚焦搜索框
      setTimeout(() => inputRef.current?.focus(), 0)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValue('none')
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 隐藏的真实 input 用于 form 提交 */}
      <input type="hidden" name={name} value={selectedValue} />

      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span className={cn('truncate', !selectedBreed && 'text-muted-foreground')}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selectedBreed && (
            <X
              className="h-4 w-4 flex-shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* 下拉列表 */}
      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-input bg-background shadow-md">
          {/* 搜索框 */}
          <div className="border-b border-input p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />
          </div>

          {/* 选项列表 */}
          <div className="max-h-64 overflow-y-auto">
            {/* "不关联"选项 */}
            <div
              onClick={() => handleSelect('none')}
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                'hover:bg-muted',
                selectedValue === 'none' && 'bg-primary/10'
              )}
            >
              <span>不关联</span>
              {selectedValue === 'none' && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>

            {/* 品种选项 */}
            {filteredBreeds.length > 0 ? (
              filteredBreeds.map((breed) => (
                <div
                  key={breed.slug}
                  onClick={() => handleSelect(breed.slug)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                    'hover:bg-muted',
                    selectedValue === breed.slug && 'bg-primary/10'
                  )}
                >
                  <div>
                    <div className="font-medium">{breed.name}</div>
                    {breed.cnName && (
                      <div className="text-xs text-muted-foreground">{breed.cnName}</div>
                    )}
                  </div>
                  {selectedValue === breed.slug && (
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                找不到匹配的犬种
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
