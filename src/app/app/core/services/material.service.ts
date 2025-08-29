import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Material } from '../models/material.model';
import { StorageService } from './storage.service';
import { v4 as uuid } from 'uuid';


const KEY = 'materials';


@Injectable({ providedIn: 'root' })
export class MaterialService {
private http = inject(HttpClient);
private storage = inject(StorageService);
private cache: Material[] = [];


async load(): Promise<Material[]> {
if (this.cache.length) return this.cache;
const persisted = this.storage.get<Material[]>(KEY, []);
if (persisted.length) {
this.cache = persisted;
return persisted;
}
const data = await this.http.get<Material[]>('assets/mock/materiales.json').toPromise();
this.cache = data ?? [];
this.storage.set(KEY, this.cache);
return this.cache;
}


list(): Material[] { return this.cache; }
byId(id: string): Material | undefined { return this.cache.find(m => m.id === id); }


add(payload: Omit<Material, 'id'>) {
const item: Material = { id: uuid(), ...payload };
this.cache.push(item);
this.storage.set(KEY, this.cache);
}


update(id: string, partial: Partial<Material>) {
const idx = this.cache.findIndex(m => m.id === id);
if (idx >= 0) {
this.cache[idx] = { ...this.cache[idx], ...partial };
this.storage.set(KEY, this.cache);
}
}


remove(id: string) {
this.cache = this.cache.filter(m => m.id !== id);
this.storage.set(KEY, this.cache);
}
}