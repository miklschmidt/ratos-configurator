/**
 * 1) Check if board is already flashed and connected, if yes proceed to ?.
 * 2) Compile firmware for board and start download (if flash via sd card)
 * 3) Tell the user to follow the flashing instructions at os.ratrig.com. Poll board serial path in the background. Show tips about flashing.
 * 4) Once board presence is confirmed, verify automatic flashing if supported. (allow skipping)
 * 5) Printer configuration!
 */

import { DownloadIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import React from 'react';
import { Board } from '../../../pages/api/mcu/boards';
import { Button } from '../../button';
import { Spinner } from '../../spinner';

interface CompileFirmwareProps {
	board: Board;
}

export const CompileFirmware: React.FC<CompileFirmwareProps> = (props) => {
	return (
		<div className='space-y-4'>
			<h3 className='text-xl font-medium text-gray-900'>Compiling {props.board.name} firmware, please wait</h3>
			<div className='flex justify-center items-center mb-4 h-24'>
				<Spinner />
			</div>
		</div>
	);
};

interface BoardNotDetectedProps {
	board: Board;
}

export const BoardNotDetected: React.FC<BoardNotDetectedProps> = (props) => {
	return (
		<div className='space-y-4'>
			<h3 className='text-xl font-medium text-gray-900'>
				{props.board.manufacturer} {props.board.name} was not detected
			</h3>
			<p className='mt-4 prose text-base text-gray-500'>
				<ul>
					<li>Disconnect all wires except Power and USB, and make sure your jumpers are set correctly.</li>
					<li>Use a small capacity SD card, formatted as FAT16 or FAT32 with the lowest available block size</li>
					<li>
						Make sure the firmware file is called firmware.bin (enable "display file extensions" in your file explorer)
					</li>
				</ul>
			</p>
			<p>
				<Link href={`/api/mcu/download_firmware?mcuPath=${props.board.serialPath}`}>
					<DownloadIcon /> Download firmware
				</Link>
			</p>
		</div>
	);
};

export const BoardDetected = () => {
	return (
		<div className='space-y-4'>
			<h3 className='text-xl font-medium text-gray-900'>Your control board was not detected</h3>
			<p className='mt-4 prose text-base text-gray-500'>
				<ul>
					<li>Disconnect all wires except Power and USB, and make sure your jumpers are set correctly.</li>
					<li>Use a small capacity SD card, formatted as FAT16 or FAT32 with the lowest available block size</li>
					<li>
						Make sure the firmware file is called firmware.bin (enable "display extensions" in your file explorer)
					</li>
				</ul>
			</p>
		</div>
	);
};

export const MCUFlashStep = () => {
	return (
		<div className='space-y-4'>
			<h3 className='text-xl font-medium text-gray-900'>Your control board was not detected</h3>
			<p className='mt-4 prose text-base text-gray-500'>
				<ul>
					<li>Disconnect all wires except Power and USB, and make sure your jumpers are set correctly.</li>
					<li>Use a small capacity SD card, formatted as FAT16 or FAT32 with the lowest available block size</li>
					<li>
						Make sure the firmware file is called firmware.bin (enable "display extensions" in your file explorer)
					</li>
				</ul>
			</p>
		</div>
	);
};
