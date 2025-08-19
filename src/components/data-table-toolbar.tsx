"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddClientDialog } from "@/components/add-client-dialog"
import { Client } from "@/lib/types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddClient: (client: Client) => void
}

export function DataTableToolbar<TData>({
  table,
  onAddClient,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        <AddClientDialog onAdd={onAddClient}>
          <Button size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </AddClientDialog>
      </div>
    </div>
  )
}
