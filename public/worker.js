import { pipeline, env } from './1.js';

env.backends.onnx.wasm.wasmPaths = './';
env.allowLocalModels = true;
env.localModelPath = '/models';

let detector = null;

self.onmessage = async (event) => {
	const { type, data } = event.data;

	if (type === 'detect') {
		if (!detector) {
			self.postMessage({ status: 'error', message: 'Detector not initialized.' });
			return;
		}
		const output = await detector(data.imgSrc, {
			threshold: 0.5,
			percentage: true,
		});
		self.postMessage({ status: 'complete', output });
	}
};

async function loadModel() {
	try {
		detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
			progress_callback: (progress) => {
				self.postMessage({ status: 'progress', data: progress });
			},
		});
		self.postMessage({ status: 'ready' });
	} catch (error) {
		self.postMessage({ status: 'error', message: error.message });
	}
}

loadModel();
