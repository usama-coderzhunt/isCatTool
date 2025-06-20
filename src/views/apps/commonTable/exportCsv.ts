import { unparse as convertToCSV } from 'papaparse'
import { saveAs } from 'file-saver'

import type { Client } from '@/types/apps/TableDataTypes'

export const exportClientsToCSV = (clientsData: Client[]) => {
  if (!clientsData || clientsData?.length === 0) {
    alert('No data available to export.')

    return
  }

  // Ensure we use `clientsData.results`
  const formattedClients = clientsData?.map((client: any) => ({
    ID: client.id,
    First_Name: client.first_name,
    Last_Name: client.last_name,
    Email: client.email || '-',
    Phone_Number: client.phone_number || '-',
    Date_of_Birth: client.date_of_birth || '-',
    Address: client.address || '-',
    Notes: client.notes || '-',
    Is_Active: client.is_active ? 'Active' : 'Inactive',
    Client_Type: client.client_type,
    Converted_to_Client: client.converted_to_client ? 'Yes' : 'No',
    Country: client.customer_country || '-',
    Created_At: client.created_at,
    Updated_At: client.updated_at,
    Created_By: client.created_by,
    Updated_By: client.updated_by || '-'
  }))

  // Convert JSON to CSV
  const csv = convertToCSV(formattedClients, { header: true })

  // Create and trigger CSV download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  saveAs(blob, 'clients.csv')
}
