const constants = {
  "sera-chat": {
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "extract_transaction_info",
          "description": "Extract transaction information including vendor, amount, and timestamp.",
          "parameters": {
            "type": "object",
            "properties": {
              "amount": {
                "description": "The amount paid by the payee.",
                "type": "number"
              },
              "timestamp": {
                "description": "The datetime timestamp of the transaction.",
                "format": "date-time",
                "type": "string"
              },
              "vendor": {
                "description": "The vendor that was paid.",
                "type": "string"
              }
            },
            "required": [
              "vendor",
              "amount",
              "timestamp"
            ]
          }
        }
      },
      
    ]
  }
};

export default constants;