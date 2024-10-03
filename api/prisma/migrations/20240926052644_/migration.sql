-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
