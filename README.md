# bnb-inv
Inventory web app for a bed and breakfast - airbnb business
Features:
- Use Case Flow
    - User creates Item info on Master Inventory
    - User creates a record on Purchases
        Master Inventory: add Quantity on Current Stock, update Cost
    - User create a record on Item Usage
        Master Inventory Current Stock should be deducted
    - User create a record on Damage Tracker
        Master Inventory Current Stock should be deducted
- Minimalist UI
- Dashboard
    - Number of Low Stock ( if current stock is less than minimum)
    - Current total cost ( from master inventory current stock * cost of all items )
    - List of Items with Low Stock
- CRUD from a Google Sheet
    User will have to connect their google account
- Master Inventory
    List of all items current stock and cost per item
    Can add, edit or delete items ( CurrentStock and Cost is not an input, should be derived from Purchases )
    Filters: ItemName, Tag, Category
    - Columns/Attributes
        Category
        ItemName
        Unit
        CurrentStock ( sum of item quantity from Purchases minus Item Usage item quantity)
        Minimum
        ReorderQty
        Cost
        Storage
        Status
        Tags
        Note
- Purchases
    Purchase transactions
    - Columns/Attributes
        Date
        ItemName
        Unit
        Quantity
        Cost
        Note
- Item Usage
    - Columns/Attributes
        Date
        ItemName
        Unit
        Quantity
        Note
        Room
- Damage Tracker
    For tracking damaged items
    - Columns/Attibutes
        Date
        ItemName
        Quantity
        RemainingQty
        Description
        Location

Remaining Item:
- Improve UI
    - standardize comboboxes
    - spacing between forms is too narrow
    - wide empty space on the initial view for wide screens
    - color scheme is too plain


- Remove reset sample button and replace with Google Sync setting button, on click, ask for the Sheet ID then proceed with the new google sync logic.  
- Improve google sheet synching
- - is it possible to only connect your account and google once? then no need to reconnect on refresh?
- - - if already connected then on refresh auto synch with current sheet.
- - sync sheet data with current data on Save Item / Record purchase, usage and damage


Prompt on improvement
- Remove reset sample button and sample data. Then replace the button with Google Sync setting button, on click, ask for the Sheet ID then proceed with the new google sync logic.  The new google sync logic should have the user to only connect their account and set google sheet id once. On page load, load the data from the sheet, then on transactions (Save item, Record purchase, Record usage and Record Damage) data should be updated on the sheet accordingly, it should also synchronize with the master inventory list based on the transanction. 

