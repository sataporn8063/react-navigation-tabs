import * as React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {SceneRendererProps, TabView} from 'react-native-tab-view';
import createTabNavigator, {NavigationViewProps,} from '../utils/createTabNavigator';
import MaterialTopTabBar from '../views/MaterialTopTabBar';
import {MaterialTabBarOptions, NavigationMaterialTabOptions, NavigationTabProp, SceneDescriptorMap,} from '../types';
import cloneDeep from 'lodash/cloneDeep';


type Route = {
    key: string;
    routeName: string;
};

type Config = {
    keyboardDismissMode?: 'none' | 'on-drag';
    swipeEnabled?: boolean;
    swipeDistanceThreshold?: number;
    swipeVelocityThreshold?: number;
    initialLayout?: { width?: number; height?: number };
    lazy?: boolean;
    lazyPlaceholderComponent?: React.ComponentType<{ route: Route }>;
    pagerComponent?: React.ComponentType<Parameters<React.ComponentProps<typeof TabView>['renderPager']>[0]>;
    tabBarComponent?: React.ComponentType<any>;
    tabBarOptions?: MaterialTabBarOptions;
    tabBarPosition?: 'top' | 'bottom';
    sceneContainerStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    hiddenRouteName?: string;
};

type Props = NavigationViewProps &
    Config & {
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
    navigation: NavigationTabProp;
    descriptors: SceneDescriptorMap;
    screenProps?: unknown;
};

class MaterialTabView extends React.PureComponent<Props> {
    private renderTabBar = (props: SceneRendererProps) => {
        const {state} = this.props.navigation;
        const route = state.routes[state.index];
        const {descriptors} = this.props;
        const descriptor = descriptors[route.key];
        const options = descriptor.options;

        const tabBarVisible =
            options.tabBarVisible == null ? true : options.tabBarVisible;

        const {
            navigation,
            getLabelText,
            getAccessibilityLabel,
            getTestID,
            renderIcon,
            onTabPress,
            onTabLongPress,
            tabBarComponent: TabBarComponent = MaterialTopTabBar,
            tabBarPosition,
            tabBarOptions,
            screenProps,
            hiddenRouteName,
        } = this.props;

        let cloneNavigation = cloneDeep(navigation);
        cloneNavigation.state.routes = cloneNavigation.state.routes.filter(route => {
            if(hiddenRouteName){
                return hiddenRouteName.split('|').indexOf(route.routeName) === -1;
            }else{
                return true;
            }
        })

        if (TabBarComponent === null || !tabBarVisible || cloneNavigation.state.routes.length <= 1) {
            return null;
        }

        return (
            <TabBarComponent
                {...tabBarOptions}
                {...props}
                tabBarPosition={tabBarPosition}
                screenProps={screenProps}
                navigation={cloneNavigation}
                getLabelText={getLabelText}
                getAccessibilityLabel={getAccessibilityLabel}
                getTestID={getTestID}
                renderIcon={renderIcon}
                onTabPress={onTabPress}
                onTabLongPress={onTabLongPress}
            />
        );
    };

    render() {
        const {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            getLabelText,
            getAccessibilityLabel,
            getTestID,
            renderIcon,
            onTabPress,
            onTabLongPress,
            screenProps,
            tabBarComponent,
            tabBarOptions,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            lazyPlaceholderComponent,
            pagerComponent,
            navigation,
            descriptors,
            hiddenRouteName,
            ...rest
        } = this.props;
        let cloneNavigation = cloneDeep(navigation);
        cloneNavigation.state.routes = cloneNavigation.state.routes.filter(route => {
            if(hiddenRouteName){
                return hiddenRouteName.split('|').indexOf(route.routeName) === -1;
            }else{
                return true;
            }
        })
        // console.log('navigation', navigation);

        const {state} = cloneNavigation;
        const route = state.routes[state.index];

        const descriptor = descriptors[route.key];
        const options = descriptor.options;

        let swipeEnabled =
            // @ts-ignore
            options.swipeEnabled == null
                ? this.props.swipeEnabled
                : (options as any).swipeEnabled;

        if (typeof swipeEnabled === 'function') {
            swipeEnabled = swipeEnabled(state);
        }


        return (
            <TabView
                {...rest}
                navigationState={cloneNavigation.state}
                swipeEnabled={swipeEnabled}
                renderTabBar={this.renderTabBar}
                renderLazyPlaceholder={
                    lazyPlaceholderComponent !== undefined
                        ? (props) => React.createElement(lazyPlaceholderComponent, props)
                        : undefined
                }
                renderPager={
                    pagerComponent !== undefined
                        ? (props) => React.createElement(pagerComponent, props)
                        : undefined
                }
            />
        );
    }
}

export default createTabNavigator<Config, NavigationMaterialTabOptions, Props>(
    MaterialTabView
);
