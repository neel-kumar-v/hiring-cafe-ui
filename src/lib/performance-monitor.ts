// export interface PerformanceMetrics {
//   lcp: number;
//   fid: number;
//   cls: number;
//   fcp: number;
//   tti: number;
//   tbt: number;
//   speedIndex: number;
// }

// export class PerformanceMonitor {
//   private static instance: PerformanceMonitor;
//   private metrics: PerformanceMetrics | null = null;
//   private observers: PerformanceObserver[] = [];

//   static getInstance(): PerformanceMonitor {
//     if (!PerformanceMonitor.instance) {
//       PerformanceMonitor.instance = new PerformanceMonitor();
//     }
//     return PerformanceMonitor.instance;
//   }

//   startMonitoring(): void {
//     if (typeof window === 'undefined') return;

//     this.monitorLCP();
//     this.monitorFID();
//     this.monitorCLS();
//     this.monitorFCP();
//     this.monitorTTI();
//     this.monitorTBT();
//     this.monitorSpeedIndex();
//   }

//   private monitorLCP(): void {
//     if (!('PerformanceObserver' in window)) return;

//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       const lastEntry = entries[entries.length - 1];
//       if (lastEntry) {
//         this.metrics = { ...this.metrics, lcp: lastEntry.startTime };
//       }
//     });
//     observer.observe({ entryTypes: ['largest-contentful-paint'] });
//     this.observers.push(observer);
//   }

//   private monitorFID(): void {
//     if (!('PerformanceObserver' in window)) return;

//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       entries.forEach((entry) => {
//         const fid = entry.processingStart - entry.startTime;
//         this.metrics = { ...this.metrics, fid };
//         console.log('⚡ FID:', fid.toFixed(2), 'ms');
//       });
//     });
//     observer.observe({ entryTypes: ['first-input'] });
//     this.observers.push(observer);
//   }

//   private monitorCLS(): void {
//     if (!('PerformanceObserver' in window)) return;

//     let clsValue = 0;
//     const observer = new PerformanceObserver((list) => {
//       for (const entry of list.getEntries()) {
//         const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
//         if (!layoutShiftEntry.hadRecentInput) {
//           clsValue += layoutShiftEntry.value || 0;
//           this.metrics = { ...this.metrics, cls: clsValue };
//           console.log('📐 CLS:', clsValue.toFixed(4));
//         }
//       }
//     });
//     observer.observe({ entryTypes: ['layout-shift'] });
//     this.observers.push(observer);
//   }

//   private monitorFCP(): void {
//     if (!('PerformanceObserver' in window)) return;

//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
//       if (fcpEntry) {
//         this.metrics = { ...this.metrics, fcp: fcpEntry.startTime };
//         console.log('🎨 FCP:', fcpEntry.startTime.toFixed(2), 'ms');
//       }
//     });
//     observer.observe({ entryTypes: ['paint'] });
//     this.observers.push(observer);
//   }

//   private monitorTTI(): void {
//     if (!('PerformanceObserver' in window)) return;

//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       const ttiEntry = entries.find(entry => entry.name === 'TTI');
//       if (ttiEntry) {
//         this.metrics = { ...this.metrics, tti: ttiEntry.startTime };
//         console.log('⏱️ TTI:', ttiEntry.startTime.toFixed(2), 'ms');
//       }
//     });
//     observer.observe({ entryTypes: ['measure'] });
//     this.observers.push(observer);
//   }

//   private monitorTBT(): void {
//     if (!('PerformanceObserver' in window)) return;

//     let totalBlockingTime = 0;
//     const observer = new PerformanceObserver((list) => {
//       for (const entry of list.getEntries()) {
//         if (entry.duration > 50) {
//           totalBlockingTime += entry.duration - 50;
//         }
//       }
//       this.metrics = { ...this.metrics, tbt: totalBlockingTime };
//       console.log('🚫 TBT:', totalBlockingTime.toFixed(2), 'ms');
//     });
//     observer.observe({ entryTypes: ['longtask'] });
//     this.observers.push(observer);
//   }

//   private monitorSpeedIndex(): void {
//     if (!('PerformanceObserver' in window)) return;

//     const observer = new PerformanceObserver((list) => {
//       const entries = list.getEntries();
//       const speedIndexEntry = entries.find(entry => entry.name === 'Speed Index');
//       if (speedIndexEntry) {
//         this.metrics = { ...this.metrics, speedIndex: speedIndexEntry.startTime };
//         console.log('📊 Speed Index:', speedIndexEntry.startTime.toFixed(2), 'ms');
//       }
//     });
//     observer.observe({ entryTypes: ['measure'] });
//     this.observers.push(observer);
//   }

//   getMetrics(): PerformanceMetrics | null {
//     return this.metrics;
//   }

//   logSummary(): void {
//     if (!this.metrics) {
//       console.log('📈 No performance metrics available yet');
//       return;
//     }

//     console.log('📈 Performance Summary:');
//     console.log(`  LCP: ${this.metrics.lcp?.toFixed(2) || 'N/A'} ms`);
//     console.log(`  FID: ${this.metrics.fid?.toFixed(2) || 'N/A'} ms`);
//     console.log(`  CLS: ${this.metrics.cls?.toFixed(4) || 'N/A'}`);
//     console.log(`  FCP: ${this.metrics.fcp?.toFixed(2) || 'N/A'} ms`);
//     console.log(`  TTI: ${this.metrics.tti?.toFixed(2) || 'N/A'} ms`);
//     console.log(`  TBT: ${this.metrics.tbt?.toFixed(2) || 'N/A'} ms`);
//     console.log(`  Speed Index: ${this.metrics.speedIndex?.toFixed(2) || 'N/A'} ms`);
//   }

//   cleanup(): void {
//     this.observers.forEach(observer => observer.disconnect());
//     this.observers = [];
//   }
// }