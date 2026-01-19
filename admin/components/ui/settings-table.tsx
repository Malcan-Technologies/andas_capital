"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Badge } from "./badge"
import { Switch } from "./switch"
import { Input } from "./input"
import { Select } from "./select"
import { Tooltip } from "./tooltip"
import { InformationCircleIcon } from "@heroicons/react/24/outline"

interface SystemSetting {
  id: string
  key: string
  category: string
  name: string
  description: string
  dataType: string
  value: any
  options?: any
  isActive: boolean
  requiresRestart: boolean
  affectsExistingLoans: boolean
  isMissing?: boolean
}

interface SettingsTableProps {
  settings: SystemSetting[]
  onSettingChange: (key: string, value: any) => void
  excludeKeys?: string[]
  className?: string
  compact?: boolean
}

function SettingsTable({
  settings,
  onSettingChange,
  excludeKeys = [],
  className,
  compact = true,
}: SettingsTableProps) {
  const filteredSettings = settings.filter(
    (s) => !excludeKeys.includes(s.key)
  )

  const renderInput = (setting: SystemSetting) => {
    const { key, dataType, value, options } = setting

    switch (dataType) {
      case "BOOLEAN":
        return (
          <Switch
            checked={value === true || value === "true"}
            onCheckedChange={(checked) => onSettingChange(key, checked)}
          />
        )

      case "ENUM":
        return (
          <Select
            value={value}
            onChange={(e) => onSettingChange(key, e.target.value)}
            className="w-full min-w-[180px]"
          >
            {options &&
              Object.entries(options).map(([optionKey, optionData]: [string, any]) => (
                <option key={optionKey} value={optionKey}>
                  {optionData.label || optionKey}
                </option>
              ))}
          </Select>
        )

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onSettingChange(key, parseFloat(e.target.value) || 0)}
            min={options?.min}
            max={options?.max}
            step={options?.step || 1}
            className="w-24"
          />
        )

      case "STRING":
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onSettingChange(key, e.target.value)}
            className="w-full min-w-[150px]"
          />
        )

      case "JSON":
        // For JSON arrays like reminder days
        if (Array.isArray(value)) {
          return (
            <Input
              type="text"
              value={value.join(", ")}
              onChange={(e) => {
                const newValue = e.target.value
                  .split(",")
                  .map((v) => parseInt(v.trim()))
                  .filter((v) => !isNaN(v))
                onSettingChange(key, newValue)
              }}
              placeholder="e.g., 7, 3, 1"
              className="w-32"
            />
          )
        }
        return (
          <Input
            type="text"
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                onSettingChange(key, JSON.parse(e.target.value))
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="w-full min-w-[150px]"
          />
        )

      default:
        return (
          <span className="text-gray-400 text-sm">
            {String(value)}
          </span>
        )
    }
  }

  if (filteredSettings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        No settings available
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-gray-700/50 overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
            <TableHead className="text-gray-300 font-semibold">Setting</TableHead>
            {!compact && <TableHead className="text-gray-300 font-semibold">Description</TableHead>}
            <TableHead className="text-gray-300 font-semibold text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSettings.map((setting) => (
            <TableRow key={setting.key}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{setting.name}</span>
                  {compact && (
                    <Tooltip content={setting.description} side="right">
                      <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  )}
                  <div className="flex gap-1">
                    {setting.requiresRestart && (
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                        Restart
                      </Badge>
                    )}
                    {setting.affectsExistingLoans && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Affects Loans
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              {!compact && (
                <TableCell className="text-gray-400 text-sm max-w-md">
                  {setting.description}
                  {setting.options && setting.dataType === "NUMBER" && (
                    <span className="text-gray-500 ml-1">
                      (Range: {setting.options.min} - {setting.options.max})
                    </span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end">
                  {renderInput(setting)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { SettingsTable }
export type { SystemSetting, SettingsTableProps }
