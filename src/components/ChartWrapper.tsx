import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  LineController,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  registerables
} from 'chart.js';

ChartJS.register(
  ...registerables,
  LineController,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: any;
  options?: any;
  className?: string;
}

export const Line: React.FC<ChartProps> = ({ data, options, className = 'w-full h-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    try {
      chartInstanceRef.current = new ChartJS(canvasRef.current, {
        type: 'line',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options,
        },
      });
    } catch (e) {
      console.warn('Line ChartJS render note:', e);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, options]);

  return <canvas ref={canvasRef} className={className} />;
};

export const Doughnut: React.FC<ChartProps> = ({ data, options, className = 'w-full h-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    try {
      chartInstanceRef.current = new ChartJS(canvasRef.current, {
        type: 'doughnut',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options,
        },
      });
    } catch (e) {
      console.warn('Doughnut ChartJS render note:', e);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, options]);

  return <canvas ref={canvasRef} className={className} />;
};
