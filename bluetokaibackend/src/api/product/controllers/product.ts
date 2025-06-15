'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    console.log('🚀 Product controller find method called');
    console.log('🔍 Query params:', ctx.query);
    
    try {
      // Use the default find method
      const { data, meta } = await super.find(ctx);
      
      console.log('📦 Controller - Data from super.find():', JSON.stringify(data, null, 2));
      console.log('📊 Controller - Meta:', meta);
      console.log('📈 Controller - Data count:', data ? data.length : 0);
      
      return { data, meta };
    } catch (error) {
      console.error('💥 Error in product controller find:', error);
      ctx.throw(500, error);
    }
  }
}));