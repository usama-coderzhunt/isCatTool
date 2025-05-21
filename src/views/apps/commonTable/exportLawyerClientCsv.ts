import { unparse as convertToCSV } from 'papaparse'
import { saveAs } from 'file-saver'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { getDisplayValue } from '@/utils/utility/displayValue'


export const exportLawyerClientsToCSV = (lawyerClientsData: LawyerClientTypes[]) => {
    if (!lawyerClientsData || lawyerClientsData?.length === 0) {
        alert('No data available to export.')

        return
    }

    // Ensure we use `lawyerClientsData.results`
    const formattedClients = lawyerClientsData?.map((client: any) => ({
        ID: getDisplayValue(client.id),
        First_Name: getDisplayValue(client.first_name),
        Middle_Name: getDisplayValue(client.middle_name),
        Last_Name: getDisplayValue(client.last_name),
        Email: getDisplayValue(client.email),
        Phone_Number: getDisplayValue(client.phone_number),
        Date_of_Birth: getDisplayValue(client.date_of_birth),
        Address: getDisplayValue(client.address),
        Notes: getDisplayValue(client.notes),
        Is_Active: client.is_active ? 'Active' : 'Inactive',
        Client_Type: getDisplayValue(client.client_type),
        Converted_to_Client: client.converted_to_client ? 'Yes' : 'No',
        Country: getDisplayValue(client.customer_country),
        Created_At: getDisplayValue(client.created_at),
        Updated_At: getDisplayValue(client.updated_at),
        Created_By: getDisplayValue(client.created_by),
        Updated_By: getDisplayValue(client.updated_by)
    }))

    // Convert JSON to CSV
    const csv = convertToCSV(formattedClients, { header: true })

    // Create and trigger CSV download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

    saveAs(blob, 'clients.csv')
}
