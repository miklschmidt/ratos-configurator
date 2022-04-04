import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { CardSelector, SelectableCard } from '../card-selector';
import { useMutation, useQuery } from 'react-query';
import { Spinner } from '../spinner';
import { ErrorMessage } from '../error-message';
import { WifiIcon } from '@heroicons/react/solid';
import { TextInput } from '../forms/text-input';
import axios from 'axios';
import { JoinErrorResponse, JoinResponse, JoinSuccessResponse, WifiCredentials } from '../../pages/api/wifi/join';
import { StepNavButton, StepNavButtons } from '../step-nav-buttons';
import { StepScreenProps } from '../../pages';
import { ScanResponseData, ScanSuccessResponse } from '../../pages/api/wifi/scan';
import { Network } from '../../helpers/iw';
import { Modal } from '../modal';
import getConfig from 'next/config';
import { Button } from '../button';
import { parseSignal } from '../../helpers/wifi';
import { MoonrakerQueryState } from '../../hooks/useMoonraker';
import { useRecoilValue } from 'recoil';

interface APList {
	[id: string]: Network;
}

interface SelectableNetwork extends SelectableCard {
	id: string;
}

export const WifiSetup: React.FC<StepScreenProps> = (props) => {
	const [apList, setApList] = useState<APList>({});
	const [selectedNetwork, setSelectedNetwork] = useState<null | Network>(null);
	const [password, setPassword] = useState('');
	const moonrakerQuery = useRecoilValue(MoonrakerQueryState);

	const { isLoading, isError, error, data } = useQuery<ScanSuccessResponse['data'], Error>(
		'accessPoints',
		async () => {
			const response = await fetch(getConfig().publicRuntimeConfig.basePath + '/api/wifi/scan');
			if (!response.ok) {
				throw new Error('Error while scanning for wifi networks.');
			}
			const data: ScanResponseData = await response.json();
			if (data?.result === 'error') {
				throw new Error(data.data.message);
			}
			return data.data;
		},
		{
			refetchInterval: (data, query) => {
				if (query.state.error) {
					return false;
				}
				return 1000;
			},
		},
	);

	useEffect(() => {
		setApList((apList) => {
			const newList = {
				...apList,
			};
			data?.accessPoints.forEach((ap) => {
				newList[ap.address] = ap;
			});
			return newList;
		});
	}, [data]);

	const cards: SelectableNetwork[] = useMemo(() => {
		if (isError) return [];
		return Object.keys(apList).map((ap) => ({
			name: apList[ap].ssid ?? 'Unknown Network',
			id: ap,
			details: (
				<>
					<span className='mr-4'>
						<span className='font-semibold'>Signal Strength:</span> {parseSignal(apList[ap].signal)}
					</span>
					<span>
						<span className='font-semibold'>Frequency:</span> {Math.round(apList[ap].frequency / 100) / 10}GHz
					</span>
				</>
			),
			right: <WifiIcon className='h-8 w-8 text-slate-500' />,
		}));
	}, [isError, apList]);

	const onSelectCard = useCallback(
		(card: SelectableNetwork) => {
			setSelectedNetwork(apList[card.id]);
		},
		[apList],
	);

	const wifiMutation = useMutation<JoinSuccessResponse, JoinErrorResponse['data']['message'], WifiCredentials>(
		(wifiCredentials: WifiCredentials) => {
			return axios
				.post<JoinResponse>(getConfig().publicRuntimeConfig.basePath + '/api/wifi/join', wifiCredentials)
				.then((val) => {
					if (val.data.result === 'error') {
						throw new Error(val.data.data.message);
					}
					return true;
				}) as Promise<JoinSuccessResponse>;
		},
	);

	const connectToWifi = useCallback(() => {
		if (selectedNetwork == null || selectedNetwork.ssid == null) {
			throw new Error('Cannot join wifi without selecting a network');
		}
		wifiMutation.mutate({ passphrase: password, ssid: selectedNetwork.ssid, country: selectedNetwork.country });
	}, [password, selectedNetwork, wifiMutation]);

	const rebootMutation = useMutation<void, string>(() => {
		if (moonrakerQuery) {
			return moonrakerQuery('machine.reboot');
		}
		return Promise.reject('Cannot reboot raspberry pi: No connection to moonraker');
	});

	const rebootAndClose = useCallback(async () => {
		rebootMutation.mutateAsync().then(() => window.close());
	}, [rebootMutation]);

	const content =
		selectedNetwork && wifiMutation.isSuccess ? (
			<Modal
				title='Connection Successful!'
				body={
					'RatOS is now connected to ' +
					selectedNetwork.ssid +
					'! Your raspberry pi will now reboot, and rejoin your local wifi network. Click the button below to reboot the pi and close this window. You can then reconnect to your local network where http://RatOS.local/ should be available in a few minutes..'
				}
				buttonLabel='Got it!'
				onClick={rebootAndClose}
			/>
		) : selectedNetwork ? (
			<TextInput
				label={selectedNetwork.security.toLocaleUpperCase() + ' Password'}
				type='password'
				error={wifiMutation.isError ? wifiMutation.error : undefined}
				onChange={setPassword}
			/>
		) : isError ? (
			<div className='mb-4 h-48'>
				<ErrorMessage>{error?.message}</ErrorMessage>
			</div>
		) : rebootMutation.isError ? (
			<div className='mb-4 h-48'>
				<ErrorMessage>{rebootMutation.error}</ErrorMessage>
			</div>
		) : Object.keys(apList).length === 0 ? (
			<div className='flex justify-center items-center mb-4 h-48'>
				<Spinner />
			</div>
		) : (
			<CardSelector<SelectableNetwork> cards={cards} onSelect={onSelectCard} />
		);

	let rightButton: StepNavButton = {
		onClick: props.nextScreen,
		label: 'Skip',
	};
	let leftButton: StepNavButton = {
		onClick: props.previousScreen,
	};

	if (selectedNetwork) {
		rightButton = {
			label: 'Connect',
			disabled: password.trim().length === 0 || wifiMutation.isLoading,
			isLoading: wifiMutation.isLoading,
			onClick: connectToWifi,
		};
		leftButton = {
			onClick: () => setSelectedNetwork(null),
			label: 'Back',
			isLoading: wifiMutation.isLoading,
			disabled: wifiMutation.isLoading,
		};
		if (wifiMutation.isSuccess) {
			rightButton = {
				onClick: props.nextScreen,
			};
			leftButton = {};
		}
	}

	return (
		<Fragment>
			<div className='p-8'>
				{' '}
				<div className='pb-5 mb-5 border-b border-gray-200'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>Configure Wifi Setup</h3>
					<p className='mt-2 max-w-4xl text-sm text-gray-500'>Pick an access point to join</p>
				</div>
				{content}
			</div>
			<StepNavButtons right={rightButton} left={leftButton} />
		</Fragment>
	);
};
