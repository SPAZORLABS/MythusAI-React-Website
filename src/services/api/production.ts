import { ProductionInfo } from '@/types';
import axiosClient from '@/api/axiosClient';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface ProductionInfoResponse extends ProductionInfo {
    id: string;
    screenplay_id: string;
}

export interface ProductionInfoResponseWrapper {
    success: boolean;
    message?: string;
    data?: ProductionInfoResponse;
}

export interface TableStructureColumn {
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
}

export interface TableStructureResponse {
    success: boolean;
    data: TableStructureColumn[];
}

export interface ColumnAddRequest {
    column_name: string;
    column_type: string;
    default_value?: any;
}

class ProductionService {
    private api = axiosClient;

    private shouldMock(error?: any): boolean {
        const mockEnabled = import.meta.env.VITE_MOCK_API === 'true';
        if (mockEnabled) return true;
        const msg = String(error?.message || '');
        return /ECONNREFUSED|ERR_NETWORK|Network Error/i.test(msg);
    }

    async createProductionInfo(screenplayId: string, productionInfo: ProductionInfo): Promise<ProductionInfoResponseWrapper> {
        if (this.shouldMock()) {
            const mockId = `pi-${Date.now()}`;
            const data: ProductionInfoResponse = {
                id: mockId,
                screenplay_id: screenplayId,
                ...productionInfo
            };
            return { success: true, data, message: 'Mock production info saved' };
        }
        const response = await this.api.post<ProductionInfoResponseWrapper>(`/production-info/${screenplayId}`, productionInfo);
        return response.data;
    }

    async updateProductionInfo(screenplayId: string, productionInfo: Partial<ProductionInfo>): Promise<ApiResponse> {
        const response = await this.api.put<ApiResponse>(`/production-info/${screenplayId}`, productionInfo);
        return response.data;
    }

    async getProductionInfo(screenplayId: string): Promise<ProductionInfoResponseWrapper> {
        if (this.shouldMock()) {
            const data: ProductionInfoResponse = {
                id: `pi-${screenplayId}`,
                screenplay_id: screenplayId,
                // Minimal default mock values
                company_name: 'Demo Productions',
                production_number: 'DP-001',
                title: 'Demo Screenplay',
                company_address: '123 Demo St',
                genre: 'Drama',
                production_status: 'Pre-Production',
                shoot_start_date: new Date().toISOString(),
                shoot_end_date: new Date(Date.now() + 7*24*3600*1000).toISOString(),
                director_name: 'Jane Doe',
                assistant_director: '',
                producer_name: '',
                dop_name: '',
                camera_operator: '',
                editor_name: '',
                sound_engineer: '',
                art_director: '',
                production_designer: '',
                gaffer: '',
                wardrobe_department: '',
                makeup_hair_department: '',
                action_director: '',
                stunt_coordinator: '',
                vfx_supervisor: '',
                colorist: '',
                music_director: '',
                // Add any optional fields as empty defaults
            } as ProductionInfoResponse;
            return { success: true, data };
        }
        const response = await this.api.get<ProductionInfoResponseWrapper>(`/production-info/${screenplayId}`);
        return response.data;
    }

    async getTableStructure(): Promise<TableStructureResponse> {
        const response = await this.api.get<TableStructureResponse>('/production-info/table/structure');
        return response.data;
    }

    async addColumn(request: ColumnAddRequest): Promise<ApiResponse> {
        const response = await this.api.post<ApiResponse>('/production-info/table/add-column', request);
        return response.data;
    }

    async removeColumn(columnName: string): Promise<ApiResponse> {
        const response = await this.api.delete<ApiResponse>(`/production-info/table/remove-column/${columnName}`);
        return response.data;
    }

    async listColumns(): Promise<ApiResponse<{ total_columns: number; columns: string[] }>> {
        const response = await this.api.get<ApiResponse<{ total_columns: number; columns: string[] }>>('/table/columns');
        return response.data;
    }
}

export const productionService = new ProductionService();
