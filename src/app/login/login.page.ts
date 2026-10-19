import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonInput, IonButton, IonToast
} from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonToast
  ],
})
export class LoginPage {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  toastMessage = '';
  isToastOpen = false;

  async doLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this.supabaseService.login(email!, password!);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      this.toastMessage = 'Error de acceso: ' + e.message;
      this.isToastOpen = true;
    } finally {
      this.loading = false;
    }
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}