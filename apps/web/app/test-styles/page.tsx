"use client";

import styled from "styled-components";

const TestContainer = styled.div`
	padding: 20px;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 8px;
	margin: 20px;
`;

const TestHeading = styled.h1`
	color: #3b82f6;
	font-size: 24px;
	margin-bottom: 10px;
`;

const TestParagraph = styled.p`
	color: #666;
	line-height: 1.6;
`;

export default function TestStylesPage() {
	return (
		<TestContainer>
			<TestHeading>Styled Components SSR Test</TestHeading>
			<TestParagraph>
				If you see this text with proper styling immediately on page load (no
				flash of unstyled content), then styled-components SSR is working
				correctly.
			</TestParagraph>
			<TestParagraph>
				The background should be gray, the heading should be blue, and there
				should be a border around this container.
			</TestParagraph>
		</TestContainer>
	);
}
