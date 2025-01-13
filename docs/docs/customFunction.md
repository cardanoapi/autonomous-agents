# Adding New Functions to the DTO

This document provides a summary of how to add new functions to the DTO schema.

## Steps to Add a New Function

### 1. **Determine the Group**
- Locate the relevant `group` (e.g., `Certificates`, `Vote`, `Payment`, `Governance Proposal`).
- If no group exists, create a new one:
  ```
  {
      group: 'NewGroupName',
      items: []
  }
  ```

### 2. **Define the Function**
- Add a new entry to the `items` array with:
    - **`id`**: Unique identifier.
    - **`name`**: Human-readable function name.
    - **`description`**: Function purpose.
    - **`parameters`** (optional): Array of input parameters.
    - **`canBeEvent`** (optional): Set to `true` if the function triggers events.
    - **`eventName`** (optional): Event name.
    - **`eventParameters`** (optional): Event-specific parameters.
    - **`eventDescription`** (optional): Event purpose.

### 3. **Define Parameters**
- Structure parameters as:
  ```
  {
      id: 'parameter_id',
      name: 'Parameter Name',
      type: 'data_type',
      optional: true, // Optional if not mandatory
      parameters: [] // For nested objects or options
  }
  ```
- Supported data types:
    - `string`, `number`, `url`, `hash`, `object`, `list`, `options`.
- Example:
  ```
  {
      id: 'anchor',
      type: 'object',
      name: 'Anchor',
      optional: true,
      parameters: [
          { id: 'url', name: 'Url', type: 'url', optional: false },
          { id: 'dataHash', name: 'Data Hash', type: 'hash', optional: true }
      ]
  }
  ```

### 4. **Define Events**
- If applicable, define event metadata:
  ```
  canBeEvent: true,
  eventName: 'EventName',
  eventParameters: [
      { id: 'parameter_id', name: 'Parameter Name', type: 'data_type' }
  ],
  eventDescription: 'Brief description of the event'
  ```

### 5. **Add Descriptions**
- Ensure `description` fields for functions and parameters are clear and concise.

---

## Example: Adding a New Function

Adding a new function under `Certificates`:

```
{
    group: 'Certificates',
    items: [
        {
            id: 'newCertificateFunction',
            name: 'New Certificate Function',
            description: 'Description of the new certificate function.',
            parameters: [
                { id: 'param1', name: 'Parameter 1', type: 'string', optional: false },
                { id: 'param2', name: 'Parameter 2', type: 'number', optional: true }
            ],
            canBeEvent: true,
            eventName: 'NewCertificateEvent',
            eventParameters: [
                { id: 'eventParam1', name: 'Event Parameter 1', type: 'string' }
            ],
            eventDescription: 'Triggered when the new certificate function is executed.'
        }
    ]
}
```

---

## Notes

1. **Maintain Consistency**: Follow the existing structure and naming conventions.
2. **Descriptive Names**: Use meaningful names for IDs and parameters.
3. **Validate Data**: Ensure accuracy of data types and optional fields.
4. **Test**: Verify functionality and integration.

This guide ensures a structured approach to adding functions to the DTO.
