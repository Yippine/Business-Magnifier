'use client';
import { useState } from 'react';

interface CalculationResult {
  yield: number;
  defectRate: number;
  totalCost: number;
  lossCost: number;
}

export default function YieldCalculator() {
  const [totalQuantity, setTotalQuantity] = useState('1000');
  const [defectQuantity, setDefectQuantity] = useState('50');
  const [unitCost, setUnitCost] = useState('100');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateYield = () => {
    const total = parseInt(totalQuantity);
    const defects = parseInt(defectQuantity);
    const cost = parseFloat(unitCost);

    const yieldRate = ((total - defects) / total) * 100;
    const defectRate = (defects / total) * 100;
    const totalCost = total * cost;
    const lossCost = defects * cost;

    setResult({
      yield: yieldRate,
      defectRate: defectRate,
      totalCost: totalCost,
      lossCost: lossCost,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          總生產量 (件)
        </label>
        <input
          type="number"
          value={totalQuantity}
          onChange={e => setTotalQuantity(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          不良品數量 (件)
        </label>
        <input
          type="number"
          value={defectQuantity}
          onChange={e => setDefectQuantity(e.target.value)}
          min="0"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          單件成本 (NT$)
        </label>
        <input
          type="number"
          value={unitCost}
          onChange={e => setUnitCost(e.target.value)}
          min="0"
          step="0.1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={calculateYield}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算良率與損失
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">良率</p>
              <p className="text-xl font-medium text-gray-900">
                {result.yield.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">不良率</p>
              <p className="text-xl font-medium text-gray-900">
                {result.defectRate.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">總成本</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.totalCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">損失成本</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.lossCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
