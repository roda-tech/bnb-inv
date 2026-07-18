# bnb-inv
Inventory web app for a bed and breakfast - airbnb business
Features:
- Dashboard
    - Number of Low Stock ( if current stock is less than minimum)
    - Current total cost ( from master inventory current stock * cost of all items )
    - List of Items with Low Stock
- CRUD from a Google Sheet
    User will have to connect their google account
- Master Inventory
    List of all items current stock and cost per item
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
        Note



