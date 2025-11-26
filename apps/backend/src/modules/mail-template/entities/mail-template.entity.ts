import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { IsString, IsBoolean, IsOptional, IsArray, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { EmailFlow } from '../../email-flow/entities/email-flow.entity';

@Entity('mail_templates')
@Index('IDX_MAIL_TEMPLATE_NAME', ['name'], { unique: true })
@Index('IDX_MAIL_TEMPLATE_TYPE', ['type'])
@Index('IDX_MAIL_TEMPLATE_ACTIVE', ['isActive'])
@Index('IDX_MAIL_TEMPLATE_TYPE_ACTIVE', ['type', 'isActive'])
export class MailTemplate extends BaseEntity {
  @Expose()
  @Column({ 
    unique: true, 
    length: 255,
    comment: 'Unique identifier for the template'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Expose()
  @Column({ 
    length: 500,
    comment: 'Email subject line with support for variables'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @Expose()
  @Column({ 
    type: 'text',
    comment: 'Email body content with support for variables/placeholders'
  })
  @IsString()
  @MinLength(1)
  body: string;

  @Expose()
  @Column({ 
    length: 100,
    comment: 'Template category/type (e.g., welcome, notification, marketing)'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  type: string;

  @Expose()
  @Column({ 
    name: 'is_active',
    default: true,
    comment: 'Whether template is enabled for use'
  })
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Optional description of the template purpose'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Expose()
  @Column({ 
    type: 'text',
    array: true,
    default: '{}',
    nullable: true,
    comment: 'Array of available variables for this template'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @Expose()
  @Column({ 
    name: 'from_email',
    length: 255,
    nullable: true,
    comment: 'Sender email address for this template'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @Expose()
  @Column({ 
    name: 'from_name',
    length: 255,
    nullable: true,
    comment: 'Sender display name for this template'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @Expose()
  @Column({ 
    name: 'recipient_type',
    length: 50,
    default: 'manual',
    comment: 'Recipient type: manual, roles, all_users'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  recipientType?: string;

  @Expose()
  @Column({ 
    name: 'recipient_roles',
    type: 'text',
    array: true,
    default: '{}',
    nullable: true,
    comment: 'Array of role IDs for role-based recipients'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientRoles?: string[];

  @Expose()
  @Column({ 
    name: 'email_channel_id',
    nullable: true,
    comment: 'Email channel configuration to use for sending (deprecated, use email_flow_id)'
  })
  @IsOptional()
  @IsString()
  emailChannelId?: string;

  @Expose()
  @Column({ 
    name: 'email_flow_id',
    nullable: false,
    comment: 'Email flow to use for sending (required)'
  })
  @IsString()
  emailFlowId: string;

  @Expose()
  @ManyToOne(() => EmailFlow, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'email_flow_id' })
  emailFlow: EmailFlow;

  // Helper methods for template processing
  getVariablesFromContent(): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    
    // Extract variables from subject
    let match;
    while ((match = variableRegex.exec(this.subject)) !== null) {
      variables.add(match[1].trim());
    }
    
    // Reset regex and extract variables from body
    variableRegex.lastIndex = 0;
    while ((match = variableRegex.exec(this.body)) !== null) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables);
  }

  processTemplate(variables: Record<string, any>): { subject: string; body: string } {
    let processedSubject = this.subject;
    let processedBody = this.body;

    // Replace variables in subject and body
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value || '');
      
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), stringValue);
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return {
      subject: processedSubject,
      body: processedBody
    };
  }

  validateTemplate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for basic required fields
    if (!this.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!this.subject?.trim()) {
      errors.push('Template subject is required');
    }

    if (!this.body?.trim()) {
      errors.push('Template body is required');
    }

    if (!this.type?.trim()) {
      errors.push('Template type is required');
    }

    // Check for unclosed variables
    const openBraces = (this.subject + this.body).match(/\{\{/g)?.length || 0;
    const closeBraces = (this.subject + this.body).match(/\}\}/g)?.length || 0;
    
    if (openBraces !== closeBraces) {
      errors.push('Template contains unclosed variable placeholders');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clone(newName: string): Partial<MailTemplate> {
    return {
      name: newName,
      subject: this.subject,
      body: this.body,
      type: this.type,
      description: this.description ? `Copy of ${this.description}` : `Copy of ${this.name}`,
      variables: this.variables ? [...this.variables] : undefined,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      recipientType: this.recipientType,
      recipientRoles: this.recipientRoles ? [...this.recipientRoles] : undefined,
      emailChannelId: this.emailChannelId,
      emailFlowId: this.emailFlowId,
      isActive: false // New cloned templates start as inactive
    };
  }
}
