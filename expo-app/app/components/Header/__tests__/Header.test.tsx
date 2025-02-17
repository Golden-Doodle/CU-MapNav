import { renderComponent } from "@/app/__tests__/test-utils"
import Header from "../Header"
import NextClassComponent from "../NextClassComponent";

test('header component renders correctly', () => {
    renderComponent(<Header />);
})

test('Next Class Component renders correctly', () => {
    renderComponent(<NextClassComponent />);
});
