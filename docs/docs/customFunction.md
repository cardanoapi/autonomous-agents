# Custom Function

## Frontend

1. At first navigate to `frontend` folder.
2. Then goto `src/models/types` folder and search for `functions.ts` file.
3. Now inside `functions.ts` file add new function in existing dto by following below rules.

This document provides a summary of how to add new functions to the DTO schema.

### Steps to Add a New Function

#### 1. **Determine the Group**

- Locate the relevant `group` (e.g., `Certificates`, `Vote`, `Payment`, `Governance Proposal`).
- If no group exists, create a new one:
  ```
  {
      group: 'NewGroupName',
      items: []
  }
  ```

#### 2. **Define the Function**

- Add a new entry to the `items` array with:
  <a id="function_id"></a>
    - **`id`**: Unique identifier.
    - **`name`**: Human-readable function name.
    - **`description`**: Function purpose.
    - **`parameters`** (optional): Array of input parameters.
    - **`canBeEvent`** (optional): Set to `true` if the function triggers events.
    - **`eventName`** (optional): Event name.
    - **`eventParameters`** (optional): Event-specific parameters.
    - **`eventDescription`** (optional): Event purpose.

<a id="parameters"></a>

#### 3. **Define Parameters**

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

#### 4. **Define Events** (Optional)

- If applicable, define event metadata:
  ```
  canBeEvent: true,
  eventName: 'EventName',
  eventParameters: [
      { id: 'parameter_id', name: 'Parameter Name', type: 'data_type' }
  ],
  eventDescription: 'Brief description of the event'
  ```

**`Note`**: Event type is optional but if it is to be added then all above event related properties should be added.

#### 5. **Add Descriptions**

- Ensure `description` fields for functions and parameters are clear and concise.

---

### Example: Adding a New Function

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

#### Notes

1. **Maintain Consistency**: Follow the existing structure and naming conventions.
2. **Descriptive Names**: Use meaningful names for IDs and parameters.
3. **Validate Data**: Ensure accuracy of data types and optional fields.
4. **Test**: Verify functionality and integration.

This guide ensures a structured approach to adding functions to the DTO.

---

## Agent-Node

- Now navigate to `agent-node` folder and search for `functions` folder inside `src` folder.
- Now inside the `functions` folder add the new file with the `function_name` same as `id` as mentioned above
  in [Define the Function Section](#function_id)
- Inside that file create a function with name `handler` and add first parameter as `context`. After that you can add
  the number of parameter as mentioned in [Define the Parameter Section](#parameters)

---

Finally, after adding this rerun `agent` and goto `http://localhost:300` or the url where `frontend` is hosted. Click
`My-Agent` tab and then click `Manual Trigger` tab and search for the function you just added.