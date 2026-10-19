import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionReady: Promise<void>;

  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.sessionReady = this.initSession();
  }

  async waitForSession() {
    await this.sessionReady;
  }

  private async initSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
      await this.loadRole(session.user.id);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      this.currentUser.set(data.user);
      await this.loadRole(data.user.id);
    }
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.userRole.set(null);
  }

  private async loadRole(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && data) {
      this.userRole.set(data.role);
    }
  }

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createClient(client: Client): Promise<void> {
    const { error } = await this.supabase.from('clients').insert([{
      nombre: client.nombre,
      empresa: client.empresa,
      email: client.email
    }]);
    if (error) throw error;
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    const { error } = await this.supabase.from('clients').update(client).eq('id', id);
    if (error) throw error;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await this.supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
    async getImages(): Promise<{ name: string; url: string }[]> {
    const { data: files, error } = await this.supabase.storage
      .from('imagenes')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;

    const images = (files || []).filter(f => f.name !== '.emptyFolderPlaceholder' && f.id);
    if (images.length === 0) return [];

    const { data: signed, error: signError } = await this.supabase.storage
      .from('imagenes')
      .createSignedUrls(images.map(f => f.name), 3600);
    if (signError) throw signError;

    const result: { name: string; url: string }[] = [];
    for (const s of signed || []) {
      if (s.signedUrl) {
        result.push({ name: s.path || '', url: s.signedUrl });
      }
    }
    return result; }}