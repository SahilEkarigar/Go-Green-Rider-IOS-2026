import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  constructor(private http: HttpClient, private storage: Storage) { }



  apiUrl = environment.apiUrl;
  signupUrl = this.apiUrl + 'riders/rider-signup';
  signupUrl2 = this.apiUrl + 'riders/rider-verification';
  addBankDetailsForm = this.apiUrl + 'users/addbankdetails';
  AllOrders = this.apiUrl + 'order/orderhistorybyuserid/';
  loginApi = this.apiUrl + 'riders/rider-login';
  personalDetails = this.apiUrl + 'riders/rider-personaldetails';
  rider_fullDetails = this.apiUrl + 'riders/rider-profile';
  rider_documentDetails = this.apiUrl + 'riders/get-rider-documents';
  update_RiderDocumentDetails = this.apiUrl + 'riders/update-rider-documents';
  getRiderOrderApi = this.apiUrl + 'riders/getordersbyriderid';
  rider_Status = this.apiUrl + 'riders/rider-status';
  rider_role = 4;
  riderId: string = '';



  async ngOnInit() {
    await this.storage.create();
    const user_id = await this.storage.get('user_id'); // 👈 get from Ionic storage
    this.riderId = localStorage.getItem('user_id') || 'unknown_rider';
    this.getToken()
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.storage.get('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Helper to get token and return as observable
  private getToken(): Observable<string | null> {
    return from(this.storage.get('token'));
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.storage?.get('token');
    return !!token;
  }

  registerRider(data: any): Observable<any> {
    return this.http.post(this.signupUrl, data);
  };


  async personlaData(formData: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.personalDetails, formData, { headers });
  }

  async registerRiderStep2(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.signupUrl2, data, { headers });
  }

  async addBankDetails(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.addBankDetailsForm, data, { headers });
  };

  login(data: any): Observable<any> {
    return this.http.post(this.loginApi, data);
  };


  async riderProfileDetails(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.rider_fullDetails, data, { headers });
  };

  async riderDocumentDetails(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.rider_documentDetails, data, { headers });
  };

  async updateRiderDocumentDetails(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(this.update_RiderDocumentDetails, data, { headers });
  };

  async updateRiderProfileDetails(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(this.apiUrl + 'riders/update-riderProfile', data, { headers });
  };

  async getChatMessages(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'chat/messages', data, { headers });
  }
  async vehicleDetailsData(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'riders/rider-vehicledetails', data, { headers });
  };
  async updateVehicleDetailsData(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(this.apiUrl + 'riders/update-riderVehicledetails', data, { headers });
  };
  async getOrderDetailsByRiderId(data: any, filter: string): Promise<any> {
    const headers = await this.getHeaders();
    const url = this.getRiderOrderApi + filter;  // Add filter to URL
    return this.http.put(url, data, { headers });
  }

  get_all_orders(params: { user_id?: any; rider_id?: any }, date?: string
  ): Observable<any> {

    const finalDate = date ? date : 'today';
    const endpoint = this.AllOrders + finalDate;

    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.post<any>(endpoint, params, { headers });
      })
    );
  }


  sendFCMToken(data: any): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) =>
        this.http.post(this.apiUrl + 'notifications/userfcm-token', data, { headers })
      )
    );
  }

  async removeFCMToken(data: any): Promise<Observable<any>> {
    return this.http.delete(this.apiUrl + 'notifications/remove-fcmtoken', {
      body: data
    });
  }
  async getGeoLocation(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(this.apiUrl + 'riders/updateRider-location', data, { headers });
  };

  async sendOtp(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'riders/send-riderOtp', data, { headers });
  };

  async riderVerifyOtp(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'riders/verifyotp', data, { headers });
  };
  async ResetRiderPwd(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'riders/reset-riderPwd', data, { headers });
  };
  async updatePasswordSetting(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(this.apiUrl + 'riders/chnage-riderPwd', data, { headers });
  };

  async acceptOrders(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(this.apiUrl + 'order/accept-orderbyrider', data, { headers });
  }

  updateStatusPayload(payload: any): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => {
        return this.http.post(this.rider_Status, payload, { headers });
      })
    );
  }
  async getOrderDetails(orderId: string): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(this.apiUrl + 'order/getorderdetails', { order_id: orderId }, { headers });
  }

  async handleOrderByRider(body: { orderId: string; riderId: string; status: number }): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}order/handle-orderbyrider`, body, { headers });
  }


  getReceivedOrders(user_id: string): Observable<any[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        // take rider_role from this class property
        const body = { user_id, role_id: this.rider_role };
        return this.http.post<any[]>(`${this.apiUrl}order/getallorderbyvendorid/all`, body, { headers });
      })
    );
  }
  getCordinatesofOrder(order_id: string): Observable<any[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.get<any[]>(`${this.apiUrl}location/getcordinates/${order_id}`, { headers });
      })
    );
  }
  getRiderAnalytics(user_id: string): Observable<any[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        const body = { rider_id: user_id };  // send rider_id in body
        return this.http.post<any[]>(`${this.apiUrl}riders/rider-analytics`, body, { headers });
      })
    );
  }

  // Fetch notifications for a user (rider)
  getUserNotifications(user_id: string): Observable<any[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.get<any[]>(`${this.apiUrl}notifications/all-notifications/${user_id}`, { headers });
      })
    );
  }

  // Mark a single notification as read
  markNotificationRead(notificationId: number | string): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.post<any>(`${this.apiUrl}notifications/mark-as-read`, { id: notificationId }, { headers });
      })
    );
  }

  getBankInfo(user_id: string): Observable<any[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers: HttpHeaders) => {
        const body = { user_id: user_id, role_id: this.rider_role };  // send rider_id in body
        return this.http.post<any[]>(`${this.apiUrl}riders/rider-bankdetails`, body, { headers });
      })
    );
  }

}