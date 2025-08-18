"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActionButtons } from "./action-buttons"

interface Column {
  key: string
  label: string
  className?: string
}

interface DataTableProps {
  title: string
  description: string
  columns: Column[]
  data: any[]
  renderCell: (item: any, column: Column, rowIndex: number) => React.ReactNode
}

export function DataTable({ title, description, columns, data, renderCell }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={item.id ?? rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {renderCell(item, column, rowIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
