const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const db = {
  async getQRCodes() {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getQRCodeById(id) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getQRCodeByShortCode(shortCode) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .single();
    if (error) throw error;
    return data;
  },

  async countQRCodes() {
    const { count, error } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  },

  async createQRCode(qrData) {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateQRCode(id, updates) {
    const { data, error } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async incrementClicks(id) {
    const { error } = await supabase.rpc('increment_clicks', { qr_id: id });
    if (error) throw error;
  },

  async deleteQRCode(id) {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getAnalytics(id) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('qr_id', id);
    if (error) throw error;
    return data;
  },

  async addAnalytics(analyticsData) {
    const { error } = await supabase
      .from('analytics')
      .insert([analyticsData]);
    if (error) throw error;
  }
};

const init = async () => {
  console.log('Connected to Supabase database');
};

module.exports = { db, init, supabase };
