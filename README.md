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
    - Columns/Attibutes
        Date
        ItemName
        Quantity
        RemainingQty
        Description
        Location


