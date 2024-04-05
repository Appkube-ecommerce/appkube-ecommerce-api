module.exports.getAllProducts = async (toNumber, whatsappToken) => {
    try {
      const products = await fetchAllProductsInCatalog();
      const sections = generateSectionsAndProductItems(products);
  
      const interactiveTemplate = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toNumber,
        type: "interactive",
        interactive: {
          type: "product_list",
          header: {
            type: "text",
            text: "HEADER_CONTENT",
          },
          body: {
            text: "BODY_CONTENT",
          },
          footer: {
            text: "FOOTER_CONTENT",
          },
          action: {
            catalog_id: CATALOG_ID,
            sections: sections.map(section => ({
              ...section,
              product_items: section.product_items.map(item => ({
                product_retailer_id: item.product_retailer_id
              }))
            })),
          },
        },
      };
    }}