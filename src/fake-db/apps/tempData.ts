import type { TableData } from '@/types/apps/TableDataTypes'

export const db: TableData = {
  client: [
    {
      id: 5908,
      first_name: 'test',
      middle_name: null,
      last_name: 'test last',
      email: null,
      phone_number: null,
      date_of_birth: null,
      address: null,
      notes: null,
      is_active: true,
      created_at: '2025-02-18T17:10:20.611797-05:00',
      updated_at: '2025-02-18T17:10:20.611811-05:00',
      client_type: 'client',
      converted_to_client: null,
      customer_country: null,
      created_by: 141,
      updated_by: null
    },
    {
      id: 5909,
      first_name: 'John',
      middle_name: 'Michael',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      date_of_birth: '1990-05-15',
      address: '123 Main St, New York, USA',
      notes: 'VIP client',
      is_active: true,
      created_at: '2025-02-18T17:20:10.511797-05:00',
      updated_at: '2025-02-18T17:25:30.611811-05:00',
      client_type: 'client',
      converted_to_client: true,
      customer_country: 'USA',
      created_by: 142,
      updated_by: 143
    },
    {
      id: 5910,
      first_name: 'Jane',
      middle_name: null,
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: null,
      date_of_birth: null,
      address: '456 Elm St, Los Angeles, USA',
      notes: 'New lead',
      is_active: false,
      created_at: '2025-02-19T10:15:30.611797-05:00',
      updated_at: '2025-02-19T10:20:45.611811-05:00',
      client_type: 'lead',
      converted_to_client: null,
      customer_country: 'USA',
      created_by: 144,
      updated_by: null
    }
  ]
}
