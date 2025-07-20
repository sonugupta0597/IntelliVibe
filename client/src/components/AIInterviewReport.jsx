import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIInterviewReport = ({ report }) => {
    if (!report) {
        return <p>No AI interview report available.</p>;
    }

    const getScoreColor = (score) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Interview Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <Badge className={`${getScoreColor(report.overallScore)} text-white`}>
                        {report.overallScore}/100
                    </Badge>
                </div>
                <div>
                    <h4 className="font-semibold">Summary</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AIInterviewReport;
