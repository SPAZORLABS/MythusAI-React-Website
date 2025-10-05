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

    async createProductionInfo(screenplayId: string, productionInfo: ProductionInfo): Promise<ProductionInfoResponseWrapper> {
        const response = await this.api.post<ProductionInfoResponseWrapper>(`/production-info/${screenplayId}`, productionInfo);
        return response.data;
    }

    async updateProductionInfo(screenplayId: string, productionInfo: Partial<ProductionInfo>): Promise<ApiResponse> {
        const response = await this.api.put<ApiResponse>(`/production-info/${screenplayId}`, productionInfo);
        return response.data;
    }

    async getProductionInfo(screenplayId: string): Promise<ProductionInfoResponseWrapper> {
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
