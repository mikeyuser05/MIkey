import React, { createContext, useContext } from 'react';
const ChartBufferRegistryContext = createContext<any>(null);
export const ChartBufferProvider: React.FC<any> = ({ children }) => <ChartBufferRegistryContext.Provider value={{ registerChannel: ()=>{}, deregisterChannel: ()=>{}, broadcastToChannel: ()=>{} }}>{children}</ChartBufferRegistryContext.Provider>;
export const useChartBufferRegistry = () => useContext(ChartBufferRegistryContext);